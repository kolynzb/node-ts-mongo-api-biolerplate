# Get Started

- Before you get started with the project, you must be familiar with the [prerequisites]().To get started we are going to go through project setup and installation.

## Project setup

- Clone the repository. (_make sure you have been granted access to the repo before cloning it_)

```bash
git clone https://github.com/Student-nest/nest-API.git // [!code focus]
# Move into project directory(root)
cd nest-API
```

## Installation

- To Install all packages and dependencies used in the project. Run this code.

::: code-group

```bash [pnpm]
pnpm install
```

```bash [yarn]
yarn install
```

```bash [npm]
npm install
```

:::

::: tip
[pnpm]() is the preferred package manager used in the project.
:::

## Environment Variables

- To set environment variables copy `.env.example` file as `.env` in the root directory of the project to replicate the environment variables used in the project. You can run this command.

::: code-group

```bash [windows]
cp .env.example .env
```

```bash [Linux/Mac/Bash]
cp .env.example .env
```

:::

- Fill out the variables in the `.env` file to ensure that the project works correctly.
  ::: warning

  - Make sure that all the variables in the `.env.example` file are in the `.env` file otherwise you will run into an error (_this is because of the dotenv package, you must have all the variables in the example inside the original file_)
  - **Don't add environment variable values to the `.env.example` file**
    :::

## Database Configuration

- Make sure that you have [postgres installed]()
- Create a database that the api will use.
- Fill out the database connection string in the `.env`

```bash
# replace <> with the specified content
DATABASE_URL="postgresql://<database_user>:<database_password>@localhost:5432/<database_name>?schema=public"

```

- To read more about the database connection string visit [prisma docs]()

- To generate the models in the prisma client run

::: code-group

```bash [pnpm]
pnpx prisma:generate
# OR
pnpx run prisma:generate
```

```bash [npm]
npx prisma:generate
# OR
npx run prisma:generate
```

:::

## Running Server

- To run the project in development (_this will automatically restart the server when changes are made_)

::: code-group

```bash [pnpm]
pnpm dev
# OR
pnpm run dev
```

```bash [yarn]
yarn dev
# OR
yarn run dev
```

```bash [npm]
npm dev
# OR
npm run dev
```

:::

- This should start server on your preferred host and port set in the environment variables(`.env`).but the default will be [localhost:8000](http://127.0.0.1:8000).(_This should display a home page for the api_)

:::tip
To see all the different scripts you can run for the server check the scripts in the `package.json` file at the root of the folder

:::

- To view the API documentation(Swagger) visit [http://127.0.0.1:8000/api/v1/docs/](http://127.0.0.1:8000/api/v1/docs/). This will contain the specifications for all API endpoints.

::: details Other Useful Scripts

- To find the useful scripts used in the project visit the `package.json` file under the script section

<<< ./package.json#snippet{1,2,1-2 ts:line-numbers}

:::
