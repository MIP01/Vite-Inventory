# Menggunakan image Node.js sebagai base image
FROM node:22.13.0-alpine AS build

# Set working directory
WORKDIR /app

# Menyalin package.json dan yarn.lock
COPY package.json yarn.lock ./

# Menginstal dependencies menggunakan Yarn
RUN yarn install

# Salin seluruh isi proyek ke dalam container
COPY . /app

# Membangun aplikasi untuk produksi
RUN yarn build

# Production stage menggunakan Node.js dan serve
FROM node:22.13.0-alpine

WORKDIR /app

# Install serve
RUN yarn global add serve

# Copy build files dari build stage
COPY --from=build /app/dist ./dist

# Expose port
EXPOSE 3001

# Jalankan serve dengan port
CMD ["serve", "-s", "dist", "-l", "80"]