import express, { Request, Response } from "express";

const app = express();

app.use(express.json());

app.get("/", (req: Request, res: Response): Response => {
  return res.send("Hello, World!");
});

const start = async (): Promise<void> => {
  try {
    app.listen(3000, () => {
      console.log("Server started on port 3000");
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

void start();
