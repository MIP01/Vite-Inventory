# Menggunakan image Node.js sebagai base image
FROM node:22.13.0-alpine AS build

# Set working directory
WORKDIR /app

# Salin package.json dan yarn.lock
COPY package.json yarn.lock ./

# Install semua dependencies (termasuk devDependencies)
RUN yarn install --frozen-lockfile

# Salin seluruh isi proyek ke dalam container
COPY . /app

# Membangun aplikasi untuk produksi
RUN yarn build

# Production stage
FROM node:22.13.0-alpine

WORKDIR /app

# Install serve
RUN yarn global add serve

# Salin build files dan dependencies yang diperlukan
COPY --from=build /app/dist ./dist
COPY --from=build /app/package.json ./package.json

# Expose port
EXPOSE 3001

# Jalankan serve dengan konfigurasi tambahan
CMD ["serve", "-s", "dist", "-l", "3001", "--cors"]