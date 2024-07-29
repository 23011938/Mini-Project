// Import required modules
const express = require("express"); // Import Express.js framework
const multer = require("multer"); // Import Multer for file uploads
const mysql = require("mysql2"); // Import MySQL2 for MySQL database access
const app = express(); // Create an instance of Express

// Configure Multer for file storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Define where uploaded files should be saved
    cb(null, "public/images"); // Save files in public/images directory
  },
  filename: (req, file, cb) => {
    // Define how uploaded files should be named
    cb(null, file.originalname); // Use the original file name
  },
});

const upload = multer({ storage: storage }); // Set up multer with defined storage

// Create MySQL connection
const connection = mysql.createConnection({
  host: "localhost", // MySQL host
  user: "root", // MySQL user
  password: "", // MySQL password (if any)
  database: "grocerizzapp", // MySQL database name
});

// Connect to MySQL database
connection.connect((err) => {
  if (err) {
    console.error("Error connecting to MySQL:", err); // Log connection error
    return;
  }
  console.log("Connected to MySQL database"); // Log successful connection
});

// Set up view engine
app.set("view engine", "ejs"); // Set EJS as the view engine

// Enable static files
app.use(express.static("public")); // Serve static files from public directory
app.use(express.json()); // Parse JSON bodies
app.use(
  express.urlencoded({
    extended: false,
  })
); // Parse URL-encoded bodies

// Define routes

// Route to render homepage with all products
app.get("/", (req, res) => {
  connection.query("SELECT * FROM products", (error, results) => {
    if (error) throw error; // Handle database query error
    res.render("index", { products: results }); // Render HTML page with products data
  });
});

// Route to render product details page by ID
app.get("/products/:id", (req, res) => {
  const productID = req.params.id; // Get product ID from request parameters
  const sql = "SELECT * FROM products WHERE productID = ?"; // SQL query to select product by ID
  connection.query(sql, [productID], (error, results) => {
    if (error) {
      console.error("Database query error:", error.message); // Log database query error
      return res.status(500).send("Error Retrieving product by ID"); // Handle error response
    }

    if (results.length > 0) {
      res.render("Product", { products: results[0] }); // Render product details page
    } else {
      res.status(404).send("Product not found"); // Handle product not found case
    }
  });
});

// Route to render add product form
app.get("/addProducts", (req, res) => {
  res.render("addProducts"); // Render add product form
});

// Route to handle add product form submission
app.post("/addProducts", upload.single("image"), (req, res) => {
  const { productName, stock, price } = req.body; // Extract form data
  let image;
  if (req.file) {
    image = req.file.filename; // Get uploaded image file name
  } else {
    image = null; // Handle case where no image is uploaded
  }
  const sql =
    "INSERT INTO products (productName, stock, price, image) VALUES (?, ?, ?, ?)"; // SQL query to insert new product
  connection.query(sql, [productName, stock, price, image], (error, results) => {
    if (error) {
      console.error("Error adding product:", error); // Log error adding product
      res.status(500).send(`Error adding product: ${error.message}`); // Handle error response
    } else {
      res.redirect("/"); // Redirect to homepage after successful addition
    }
  });
});

// Route to render edit product form by ID
app.get("/editProduct/:id", (req, res) => {
  const productID = req.params.id; // Get product ID from request parameters
  const sql = "SELECT * FROM products WHERE productID = ?"; // SQL query to select product by ID
  connection.query(sql, [productID], (error, results) => {
    if (error) {
      console.error("Database query error:", error.message); // Log database query error
      return res.status(500).send("Error retrieving product by ID"); // Handle error response
    }

    if (results.length > 0) {
      res.render("editProduct", { products: results[0] }); // Render edit product form
    } else {
      res.status(404).send("Product not found"); // Handle product not found case
    }
  });
});

// Route to handle edit product form submission by ID
app.post("/editProduct/:id", upload.single("image"), (req, res) => {
  const productID = req.params.id; // Get product ID from request parameters
  const { productName, stock, price } = req.body; // Extract form data
  let image = req.body.currentImage; // Get current image from form data
  if (req.file) {
    image = req.file.filename; // Get uploaded image file name if new image is uploaded
  }

  const sql =
    "UPDATE products SET productName = ?, stock = ?, price = ?, image = ? WHERE productID = ?"; // SQL query to update product
  connection.query(
    sql,
    [productName, stock, price, image, productID],
    (error, results) => {
      if (error) {
        console.error("Error updating product:", error); // Log error updating product
        res.status(500).send("Error updating product"); // Handle error response
      } else {
        res.redirect("/"); // Redirect to homepage after successful update
      }
    }
  );
});

// Route to delete product by ID
app.get("/deleteProduct/:id", (req, res) => {
  const productID = req.params.id; // Get product ID from request parameters
  const sql = "DELETE FROM products WHERE productID = ?"; // SQL query to delete product by ID
  connection.query(sql, [productID], (error, results) => {
    if (error) {
      console.error("Error deleting product:", error); // Log error deleting product
      res.status(500).send("Error deleting product"); // Handle error response
    } else {
      res.redirect("/"); // Redirect to homepage after successful deletion
    }
  });
});

// Route to render the contact form page
app.get("/contactus", (req, res) => {
  res.render("contactus"); // Render contact form page
});

// Route to handle contact form submission
app.post("/contactus", (req, res) => {
  const { firstName, lastName, email, message } = req.body; // Extract form data

  // Handle the form data (e.g., save to a database, send an email, etc.)
  console.log(
    `Received contact form submission: ${firstName}, ${lastName} ${email}, ${message}`
  );

  // Send a response back to the client
  res.send("Thank you for your message! We will get back to you soon.");
});

// Route to render the about us page
app.get("/about", (req, res) => {
  res.render("about"); // Render about us page
});

// Start the server
const PORT = process.env.PORT || 3000; // Set port number
app.listen(PORT, () => console.log(`Server running on port ${PORT}`)); // Start server and log port number

