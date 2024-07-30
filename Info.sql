-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: localhost
-- Generation Time: Jul 30, 2024 at 01:08 PM
-- Server version: 10.4.28-MariaDB
-- PHP Version: 8.1.17

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8 */;

--
-- Database: `Info`
--
CREATE DATABASE IF NOT EXISTS `Info` DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;
USE `Info`;

-- --------------------------------------------------------

--
-- Table structure for table `company`
--

CREATE TABLE `company` (
  `company_id` int(11) NOT NULL,
  `company` varchar(250) NOT NULL,
  `color` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `company`
--

INSERT INTO `company` (`company_id`, `company`, `color`) VALUES
(1, 'Grave code', 'yellow'),
(2, 'Nasa', 'blue'),
(3, 'Global Enterprise', 'purple'),
(4, 'Tech Innovators', 'red'),
(5, 'Future Solutions', 'green'),
(6, 'Digital Dreams', 'orange');

-- --------------------------------------------------------

--
-- Table structure for table `employee`
--

CREATE TABLE `employee` (
  `id` int(11) NOT NULL,
  `email` varchar(250) NOT NULL,
  `password` varchar(250) NOT NULL,
  `fname` varchar(250) NOT NULL,
  `lname` varchar(250) NOT NULL,
  `company_id` int(11) NOT NULL,
  `address` varchar(250) NOT NULL,
  `city` varchar(250) NOT NULL,
  `country` varchar(250) NOT NULL,
  `photo` varchar(250) DEFAULT NULL,
  `access_right` varchar(250) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_general_ci;

--
-- Dumping data for table `employee`
--

INSERT INTO `employee` (`id`, `email`, `password`, `fname`, `lname`, `company_id`, `address`, `city`, `country`, `photo`, `access_right`) VALUES
(376, 'cf@hotmail.com', '123456', 'Charbel', 'Fakhry', 2, '456 Maple', 'bsharre', 'lebanon', '../img/uploads/Charbel_376.jpeg', 'admin'),
(406, 'gf@hotmail.com', '123456', 'Gaelle', 'Fakhry', 3, '456 Maple', 'bsharre', 'lebanon', '../img/uploads/Gaelle_406.jpeg', 'readAndWrite'),
(437, 'bk@hotmail.com', '123456', 'Bchara', 'Kayrouz', 6, '456 Maple', 'bsharre', 'lebanon', '../img/uploads/Bchara_437.jpeg', 'read'),
(449, 'rami.fakhry@SiliconCedars.com', '123456', 'Rami', 'Fakhry', 4, '456 Maple', 'bsharre', 'lebanon', '', 'read');

--
-- Indexes for dumped tables
--

--
-- Indexes for table `company`
--
ALTER TABLE `company`
  ADD PRIMARY KEY (`company_id`);

--
-- Indexes for table `employee`
--
ALTER TABLE `employee`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `id` (`id`,`fname`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `company`
--
ALTER TABLE `company`
  MODIFY `company_id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=8;

--
-- AUTO_INCREMENT for table `employee`
--
ALTER TABLE `employee`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=450;
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;

/*!40101 SET NAMES utf8 */;
