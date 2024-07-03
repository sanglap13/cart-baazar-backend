import { Request } from "express";
import { rm } from "fs";
import {
  IBaseQuery,
  TSearchRequestQuery,
} from "../../@types/controller.types.js";
import { INewProductRequestBody } from "../../@types/interfaces/product.interface.js";
import { TryCatchWrapper } from "../../middlewares/errorHandler.js";
import ProductModel from "../../models/product.model.js";
import ErrorHandler from "../../utils/services/errorHandler.js";

import { faker } from "@faker-js/faker";
import { myCache } from "../../app.js";

// Revalidate on New,Update,Delete Product & on New Order
export const getlatestProducts = TryCatchWrapper(async (req, res, next) => {
  let products;

  if (myCache.has("latest-products"))
    products = JSON.parse(myCache.get("latest-products") as string);
  else {
    products = await ProductModel.find({}).sort({ createdAt: -1 }).limit(5);
    myCache.set("latest-products", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

// Revalidate on New,Update,Delete Product & on New Order
export const getAllCategories = TryCatchWrapper(async (req, res, next) => {
  let categories;

  if (myCache.has("categories"))
    categories = JSON.parse(myCache.get("categories") as string);
  else {
    categories = await ProductModel.distinct("category");
    myCache.set("categories", JSON.stringify(categories));
  }

  return res.status(200).json({
    success: true,
    categories,
  });
});

// Revalidate on New,Update,Delete Product & on New Order
export const getAdminProducts = TryCatchWrapper(async (req, res, next) => {
  let products;

  if (myCache.has("all-products"))
    products = JSON.parse(myCache.get("all-products") as string);
  else {
    products = await ProductModel.find({});
    myCache.set("all-products", JSON.stringify(products));
  }

  return res.status(200).json({
    success: true,
    products,
  });
});

export const getSingleProduct = TryCatchWrapper(async (req, res, next) => {
  let product;
  const id = req.params.id;

  if (myCache.has(`product-${id}`))
    product = JSON.parse(myCache.get(`product-${id}`) as string);
  else {
    product = await ProductModel.findById(id);

    if (!product) return next(new ErrorHandler("Product Not Found", 404));

    myCache.set(`product-${id}`, JSON.stringify(product));
  }

  return res.status(200).json({
    success: true,
    product,
  });
});

export const newProduct = TryCatchWrapper(
  async (req: Request<{}, {}, INewProductRequestBody>, res, next) => {
    const { name, price, stock, category } = req.body;
    const photo = req.file;

    if (!photo) return next(new ErrorHandler("Please add Photo", 400));

    if (!name || !price || !stock || !category) {
      rm(photo.path, () => {
        console.log("Deleted");
      });

      return next(new ErrorHandler("Please enter All Fields", 400));
    }

    await ProductModel.create({
      name,
      price,
      stock,
      category: category.toLowerCase(),
      photo: photo?.path,
    });

    // invalidateCache({ product: true, admin: true });

    return res.status(201).json({
      success: true,
      message: "Product Created Successfully",
    });
  }
);

export const updateProduct = TryCatchWrapper(async (req, res, next) => {
  const { id } = req.params;
  const { name, price, stock, category } = req.body;
  const photo = req.file;
  const product = await ProductModel.findById(id);

  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  if (photo) {
    rm(product.photo!, () => {
      console.log("Old Photo Deleted");
    });
    product.photo = photo.path;
  }

  if (name) product.name = name;
  if (price) product.price = price;
  if (stock) product.stock = stock;
  if (category) product.category = category;

  await product.save();

  // invalidateCache({
  //   product: true,
  //   productId: String(product._id),
  //   admin: true,
  // });

  return res.status(200).json({
    success: true,
    message: "Product Updated Successfully",
  });
});

export const deleteProduct = TryCatchWrapper(async (req, res, next) => {
  const { id } = req.params;
  const product = await ProductModel.findById(id);
  if (!product) return next(new ErrorHandler("Product Not Found", 404));

  rm(product.photo!, () => {
    console.log("Product Photo Deleted");
  });

  await product.deleteOne();

  // invalidateCache({
  //   product: true,
  //   productId: String(product._id),
  //   admin: true,
  // });

  return res.status(200).json({
    success: true,
    message: "Product Deleted Successfully",
  });
});

export const getAllProducts = TryCatchWrapper(
  async (req: Request<{}, {}, {}, TSearchRequestQuery>, res, next) => {
    const { search, sort, category, price } = req.query;

    const page = Number(req.query.page) || 1;
    // 1,2,3,4,5,6,7,8
    // 9,10,11,12,13,14,15,16
    // 17,18,19,20,21,22,23,24
    const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
    const skip = (page - 1) * limit;

    const baseQuery: IBaseQuery = {};

    if (search)
      baseQuery.name = {
        $regex: search,
        $options: "i",
      };

    if (price)
      baseQuery.price = {
        $lte: Number(price),
      };

    if (category) baseQuery.category = category;

    const productsPromise = ProductModel.find(baseQuery)
      .sort(sort && { price: sort === "asc" ? 1 : -1 })
      .limit(limit)
      .skip(skip);

    const [products, filteredOnlyProduct] = await Promise.all([
      productsPromise,
      ProductModel.find(baseQuery),
    ]);

    const totalPage = Math.ceil(filteredOnlyProduct.length / limit);

    return res.status(200).json({
      success: true,
      products,
      totalPage,
    });
  }
);

// const generateRandomProducts = async (count: number = 10) => {
//   const products = [];

//   for (let i = 0; i < count; i++) {
//     const product = {
//       name: faker.commerce.productName(),
//       photo: "uploads/d9f12a9f-0faa-448e-a20b-613361c35c28.webp",
//       price: faker.commerce.price({ min: 1500, max: 80000, dec: 0 }),
//       stock: faker.commerce.price({ min: 0, max: 100, dec: 0 }),
//       category: faker.commerce.department(),
//       createdAt: new Date(faker.date.past()),
//       updatedAt: new Date(faker.date.recent()),
//       __v: 0,
//     };

//     products.push(product);
//   }

//   await ProductModel.create(products);

//   console.log({ succecss: true });
// };

// // generateRandomProducts(40);

// const deleteRandomsProducts = async (count: number = 10) => {
//   const products = await ProductModel.find({}).skip(2);

//   for (let i = 0; i < products.length; i++) {
//     const product = products[i];
//     await product.deleteOne();
//   }

//   console.log({ succecss: true });
// };

// // deleteRandomsProducts(40);
