CREATE SCHEMA `Bamazon` ;

USE `Bamazon` ;

CREATE TABLE `Bamazon`.`products` (
  `product_id` INT NOT NULL AUTO_INCREMENT,
  `product_name` VARCHAR(100) NOT NULL,
  `price` DECIMAL(13,4) NOT NULL,
  `stock_quantity` INT NOT NULL,
  PRIMARY KEY (`product_id`),
  UNIQUE INDEX `product_id_UNIQUE` (`product_id` ASC));

CREATE TABLE `Bamazon`.`departments` (
  `department_id` INT NOT NULL AUTO_INCREMENT,
  `department_name` VARCHAR(100) NOT NULL,
  `over_head_cost` DECIMAL(13,4) NULL,
  `sale_total` DECIMAL(13,4) NULL,
  PRIMARY KEY (`department_id`),
  UNIQUE INDEX `department_id_UNIQUE` (`department_id` ASC));

ALTER TABLE `Bamazon`.`products`
  ADD COLUMN `department_id` INT(11) NOT NULL AFTER `stock_quantity`,
  ADD INDEX `department_id_idx` (`department_id` ASC);

ALTER TABLE `Bamazon`.`products`
  ADD CONSTRAINT `department_id`
  FOREIGN KEY (`department_id`)
  REFERENCES `Bamazon`.`departments` (`department_id`)
  ON DELETE CASCADE
  ON UPDATE CASCADE;

INSERT INTO `Bamazon`.`departments`
  (`department_name`, `over_head_cost`, `sale_total`)
  VALUES ('Appliances', 1000.00, 0);
INSERT INTO `Bamazon`.`departments`
  (`department_name`, `over_head_cost`, `sale_total`)
  VALUES ('Computers', 1500.00, 0);
INSERT INTO `Bamazon`.`departments`
  (`department_name`, `over_head_cost`, `sale_total`)
  VALUES ('Toys', 500.00, 0);
INSERT INTO `Bamazon`.`departments`
  (`department_name`, `over_head_cost`, `sale_total`)
  VALUES ('Car Audio', 2000.00, 0);

INSERT INTO `Bamazon`.`products`
  (`product_name`, `price`, `stock_quantity`, `department_id`)
  VALUES ('Whirlpool Washer', 175.00, 5, 1);
INSERT INTO `Bamazon`.`products`
  (`product_name`, `price`, `stock_quantity`, `department_id`)
  VALUES ('Whirlpool Dryer', 150.00, 13, 1);
INSERT INTO `Bamazon`.`products`
  (`product_name`, `price`, `stock_quantity`, `department_id`)
  VALUES ('GE Microwave', 250.00, 10, 1);
INSERT INTO `Bamazon`.`products`
  (`product_name`, `price`, `stock_quantity`, `department_id`)
  VALUES ('Samsung Refrigerator', 900.00, 4, 1);
INSERT INTO `Bamazon`.`products`
  (`product_name`, `price`, `stock_quantity`, `department_id`)
  VALUES ('Surface Pro', 1100.00, 7, 2);
INSERT INTO `Bamazon`.`products`
  (`product_name`, `price`, `stock_quantity`, `department_id`)
  VALUES ('MacBook Air', 1350.00, 5, 2);
INSERT INTO `Bamazon`.`products`
  (`product_name`, `price`, `stock_quantity`, `department_id`)
  VALUES ('Chromebook', 575.00, 15, 2);
INSERT INTO `Bamazon`.`products`
  (`product_name`, `price`, `stock_quantity`, `department_id`)
  VALUES ('Dell', 625.00, 14, 2);
INSERT INTO `Bamazon`.`products`
  (`product_name`, `price`, `stock_quantity`, `department_id`)
  VALUES ('Lego Star Wars 32409', 55.00, 20, 3);
INSERT INTO `Bamazon`.`products`
  (`product_name`, `price`, `stock_quantity`, `department_id`)
  VALUES ('Lego Star Wars Set 21922', 25.00, 29, 3);
INSERT INTO `Bamazon`.`products`
  (`product_name`, `price`, `stock_quantity`, `department_id`)
  VALUES ('Star Wars Darth Vader', 250.00, 9, 3);
INSERT INTO `Bamazon`.`products`
  (`product_name`, `price`, `stock_quantity`, `department_id`)
  VALUES ('Return of the Jedi Game', 90.00, 14, 3);
INSERT INTO `Bamazon`.`products`
  (`product_name`, `price`, `stock_quantity`, `department_id`)
  VALUES ('Speaker Box', 100.00, 7, 4);
INSERT INTO `Bamazon`.`products`
  (`product_name`, `price`, `stock_quantity`, `department_id`)
  VALUES ('GPS Navigation X', 350.00, 7, 4);
INSERT INTO `Bamazon`.`products`
  (`product_name`, `price`, `stock_quantity`, `department_id`)
  VALUES ('AMP PX200', 75.00, 5, 4);
INSERT INTO `Bamazon`.`products`
  (`product_name`, `price`, `stock_quantity`, `department_id`)
  VALUES ('Capacitor Nginx300', 505.00, 3, 4);
