# Базовый образ: Ubuntu + Python
FROM ubuntu:22.04

# Установка системных утилит, LibreOffice и Python
RUN apt update && \
    apt install -y libreoffice python3 python3-pip && \
    apt clean

# Создание рабочей папки
WORKDIR /app

# Копируем проект в контейнер
COPY . /app

# Устанавливаем зависимости Python
RUN pip3 install --no-cache-dir -r requirements.txt

# Указываем порт
EXPOSE 10000

# Запуск Flask через gunicorn
CMD ["gunicorn", "main:app", "-b", "0.0.0.0:10000"]
