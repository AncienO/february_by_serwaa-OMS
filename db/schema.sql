-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Products Table
create table products (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  sku text unique not null,
  price decimal(10, 2) not null,
  stock_quantity integer not null default 0,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Customers Table
create table customers (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  email text unique not null,
  phone text,
  address text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Orders Table
create table orders (
  id uuid default uuid_generate_v4() primary key,
  customer_id uuid references customers(id) not null,
  status text not null check (status in ('pending', 'processing', 'shipped', 'delivered', 'cancelled')),
  total_amount decimal(10, 2) not null default 0.00,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Order Items Table
create table order_items (
  id uuid default uuid_generate_v4() primary key,
  order_id uuid references orders(id) on delete cascade not null,
  product_id uuid references products(id),
  product_name text,
  quantity integer not null check (quantity > 0),
  unit_price decimal(10, 2) not null
);

-- Insert some sample data (Optional)
insert into products (name, sku, price, stock_quantity) values
('Classic White T-Shirt', 'TSH-WHT-001', 29.99, 100),
('Denim Jeans', 'JNS-BLU-001', 89.99, 50),
('Leather Jacket', 'JKT-BLK-001', 199.99, 20);

insert into customers (name, email) values
('John Doe', 'john@example.com'),
('Jane Smith', 'jane@example.com');
