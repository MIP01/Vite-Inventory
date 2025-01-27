# Menggunakan image Node.js sebagai base image
FROM node:22.13.0 AS build

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

# Menggunakan Nginx untuk menyajikan aplikasi
FROM nginx:alpine

# Menyalin hasil build ke direktori Nginx
COPY --from=build /app/dist /usr/share/nginx/html

# Menyalakan Nginx
CMD ["nginx", "-g", "daemon off;"]