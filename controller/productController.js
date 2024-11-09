const Product = require("../model/productModel");
const formidable = require("formidable");
const fs = require("fs");
const path = require("path");

module.exports = {
  createProduct: async (req, res) => {
    try {
      const form = new formidable.IncomingForm();

      form.parse(req, async (err, fields, files) => {
        console.log(fields);
        if (err) {
          console.log("Error creating", err);
          return res.status(500).json({ error: "Form parsing error" });
        }

        // Check if an image was uploaded
        if (!files.image || !files.image[0]) {
          return res.status(400).json({ error: "Image file is required" });
        }

        const oldPath = files.image[0].filepath;
        const imgData = fs.readFileSync(oldPath);

        // Define the new path for saving the file
        const newPath = path.join(
          __dirname,
          "../../../client/duan/public",
          files.image[0].originalFilename
        );

        // Write the file to the new path
        fs.writeFile(newPath, imgData, async (writeErr) => {
          if (writeErr) {
            console.log("File write error:", writeErr);
            return res.status(500).json({ error: "File write error" });
          }
          console.log("File saved successfully");

          // Create and save the product after the image is successfully saved
          const newProduct = new Product({
            name: fields.name[0],
            title: fields.title[0],
            price: parseInt(fields.price[0]),
            description: fields.description[0],
            category: fields.category[0],
            color: fields.color[0],
            brand: fields.brand[0],
            size: fields.size[0],
            quantity: parseInt(fields.quantity[0]),
            imgUrl: files.image[0].originalFilename,
          });

          try {
            const saveData = await newProduct.save();
            res
              .status(200)
              .json({ success: true, message: "Product saved", saveData });
          } catch (saveError) {
            console.log("Error saving product:", saveError);
            res.status(500).json({ error: "Error saving product to database" });
          }
        });
      });
    } catch (error) {
      console.log("error", error);
      res.status(500).json({ error: "Server error" });
    }
  },
  fetchAllProducts: async (req, res) => {
    try {
      const allProducts = await Product.find();
      res.status(200).json({ success: true, data: allProducts });
    } catch (error) {
      res.status(500).json({ success: false, message: "failed" });
    }
  },
  fetSingleProduct: async (req, res) => {
    try {
      const productId = req.params.id;
      const singleProduct = await Product.findOne({ _id: productId });
      res.status(200).json({ success: true, singleData: singleProduct });
    } catch (error) {
      res.status(500).json({ success: false, message: "failed" });
    }
  },
  deleteProduct: async (req, res) => {
    try {
      const deleteProduct = await Product.findByIdAndDelete({
        _id: req.params.id,
      });
      res.status(200).json({ success: true, message: "delete" });
    } catch (error) {
      res.status(500).json({ success: false, message: "failed" });
    }
  },
  updateProduct: async (req, res) => {
    try {
      const updateData = await Product.findOneAndUpdate(
        { _id: req.params.id },
        {
          name: req.body.name,
          title: req.body.title,
          description: req.body.description,
          price: req.body.price,
          color: req.body.color,
          category: req.body.category,
          brand: req.body.brand,
          size: req.body.size,
          quantity: req.body.quantity,
        },
        { new: true } // Return the updated document
      );

      // Check if the product was found and updated
      if (!updateData) {
        return res
          .status(404)
          .json({ success: false, message: "Product not found" });
      }

      res.status(200).json({
        success: true,
        message: "Product updated successfully",
        data: updateData,
      });
    } catch (error) {
      console.error(error); // Log the error for debugging
      res
        .status(500)
        .json({ success: false, message: "Failed to update product" });
    }
  },
};
