# <-- Base de la imagen: PHP 8.3 con FPM y Alpine (ligero)
FROM php:8.3-fpm-alpine
# Establece el directorio de trabajo dentro del contenedor
WORKDIR /var/www/html

# Instala las extensiones PHP necesarias para Laravel
RUN docker-php-ext-install pdo_mysql bcmath exif pcntl
# Si tu proyecto usa otras extensiones, agrégalas aquí:
# Por ejemplo: RUN docker-php-ext-install gd zip dom intl soap

# Instala Composer (el gestor de dependencias de PHP)
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

# Establece los permisos correctos para las carpetas 'storage' y 'bootstrap/cache' de Laravel
# Esto es vital para que Laravel pueda escribir en ellas
RUN chown -R www-data:www-data storage bootstrap/cache
