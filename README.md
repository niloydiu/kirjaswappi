# Kirjaswappi

Kirjaswappi is a book exchange platform where users can swap books with others in their community.

![Kirjaswappi](/public/vite.svg)

## Table of Contents

- [Features](#features)
- [Technologies Used](#technologies-used)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
- [Usage](#usage)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

## Features

- Browse available books for exchange
- List your own books for others to see
- Arrange book exchanges with other users
- User-friendly interface with intuitive navigation

## Technologies Used

- React 19
- Vite 6
- Tailwind CSS 4
- Axios for API requests
- React Icons

## Getting Started

Follow these instructions to get a copy of the project up and running on your local machine for development and testing purposes.

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or later)
- npm (comes with Node.js) or [yarn](https://yarnpkg.com/)
- Git

### Installation

1. Clone the repository

   ```bash
   git clone https://github.com/yourusername/kirjaswappi.git
   cd kirjaswappi
   ```

2. Install dependencies

   ```bash
   npm install
   # or if you use yarn
   yarn
   ```

3. Start the development server

   ```bash
   npm run dev
   # or
   yarn dev
   ```

4. Open your browser and navigate to `http://localhost:5173` to see the application running

## Usage

After starting the application, you can:

- Browse the collection of available books
- Click on a book to see details
- Use the interface to manage your own book listings
- Arrange exchanges with other users

## Deployment

To build the app for production:

```bash
npm run build
# or
yarn build
```

This will create a `dist` folder with all the production-ready files.

You can preview the production build locally with:

```bash
npm run preview
# or
yarn preview
```

The project is configured for deployment on [Vercel](https://vercel.com) as indicated by the vercel.json file.

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
