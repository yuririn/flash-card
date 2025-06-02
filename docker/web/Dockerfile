FROM php:8.2-apache

# 必要なモジュールをインストール
RUN apt-get update && apt-get install -y \
    libzip-dev unzip curl vim telnet libicu-dev \
    && docker-php-ext-install zip pdo pdo_mysql mysqli intl

# Slim Frameworkのインストール
WORKDIR /var/www/app

# Apacheのリライトモジュールを有効化
RUN a2enmod rewrite 
RUN a2enmod headers
