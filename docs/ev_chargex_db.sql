-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Host: 127.0.0.1
-- Generation Time: Jul 28, 2026 at 02:44 PM
-- Server version: 10.4.32-MariaDB
-- PHP Version: 8.0.30

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Database: `ev_chargex_db`
--

-- --------------------------------------------------------

--
-- Table structure for table `authtoken_token`
--

CREATE TABLE `authtoken_token` (
  `key` varchar(40) NOT NULL,
  `created` datetime(6) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_group`
--

CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL,
  `name` varchar(150) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_group_permissions`
--

CREATE TABLE `auth_group_permissions` (
  `id` bigint(20) NOT NULL,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `auth_permission`
--

CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `auth_permission`
--

INSERT INTO `auth_permission` (`id`, `name`, `content_type_id`, `codename`) VALUES
(1, 'Can add log entry', 1, 'add_logentry'),
(2, 'Can change log entry', 1, 'change_logentry'),
(3, 'Can delete log entry', 1, 'delete_logentry'),
(4, 'Can view log entry', 1, 'view_logentry'),
(5, 'Can add permission', 2, 'add_permission'),
(6, 'Can change permission', 2, 'change_permission'),
(7, 'Can delete permission', 2, 'delete_permission'),
(8, 'Can view permission', 2, 'view_permission'),
(9, 'Can add group', 3, 'add_group'),
(10, 'Can change group', 3, 'change_group'),
(11, 'Can delete group', 3, 'delete_group'),
(12, 'Can view group', 3, 'view_group'),
(13, 'Can add content type', 4, 'add_contenttype'),
(14, 'Can change content type', 4, 'change_contenttype'),
(15, 'Can delete content type', 4, 'delete_contenttype'),
(16, 'Can view content type', 4, 'view_contenttype'),
(17, 'Can add session', 5, 'add_session'),
(18, 'Can change session', 5, 'change_session'),
(19, 'Can delete session', 5, 'delete_session'),
(20, 'Can view session', 5, 'view_session'),
(21, 'Can add booking', 6, 'add_booking'),
(22, 'Can change booking', 6, 'change_booking'),
(23, 'Can delete booking', 6, 'delete_booking'),
(24, 'Can view booking', 6, 'view_booking'),
(25, 'Can add charger', 7, 'add_charger'),
(26, 'Can change charger', 7, 'change_charger'),
(27, 'Can delete charger', 7, 'delete_charger'),
(28, 'Can view charger', 7, 'view_charger'),
(29, 'Can add charging session', 8, 'add_chargingsession'),
(30, 'Can change charging session', 8, 'change_chargingsession'),
(31, 'Can delete charging session', 8, 'delete_chargingsession'),
(32, 'Can view charging session', 8, 'view_chargingsession'),
(33, 'Can add notification', 9, 'add_notification'),
(34, 'Can change notification', 9, 'change_notification'),
(35, 'Can delete notification', 9, 'delete_notification'),
(36, 'Can view notification', 9, 'view_notification'),
(37, 'Can add payment', 10, 'add_payment'),
(38, 'Can change payment', 10, 'change_payment'),
(39, 'Can delete payment', 10, 'delete_payment'),
(40, 'Can view payment', 10, 'view_payment'),
(41, 'Can add vehicle', 11, 'add_vehicle'),
(42, 'Can change vehicle', 11, 'change_vehicle'),
(43, 'Can delete vehicle', 11, 'delete_vehicle'),
(44, 'Can view vehicle', 11, 'view_vehicle'),
(45, 'Can add station', 12, 'add_station'),
(46, 'Can change station', 12, 'change_station'),
(47, 'Can delete station', 12, 'delete_station'),
(48, 'Can view station', 12, 'view_station'),
(49, 'Can add trip', 13, 'add_trip'),
(50, 'Can change trip', 13, 'change_trip'),
(51, 'Can delete trip', 13, 'delete_trip'),
(52, 'Can view trip', 13, 'view_trip'),
(53, 'Can add user', 14, 'add_user'),
(54, 'Can change user', 14, 'change_user'),
(55, 'Can delete user', 14, 'delete_user'),
(56, 'Can view user', 14, 'view_user'),
(57, 'Can add review', 15, 'add_review'),
(58, 'Can change review', 15, 'change_review'),
(59, 'Can delete review', 15, 'delete_review'),
(60, 'Can view review', 15, 'view_review'),
(61, 'Can add favorite station', 16, 'add_favoritestation'),
(62, 'Can change favorite station', 16, 'change_favoritestation'),
(63, 'Can delete favorite station', 16, 'delete_favoritestation'),
(64, 'Can view favorite station', 16, 'view_favoritestation'),
(65, 'Can add Token', 17, 'add_token'),
(66, 'Can change Token', 17, 'change_token'),
(67, 'Can delete Token', 17, 'delete_token'),
(68, 'Can view Token', 17, 'view_token'),
(69, 'Can add Token', 18, 'add_tokenproxy'),
(70, 'Can change Token', 18, 'change_tokenproxy'),
(71, 'Can delete Token', 18, 'delete_tokenproxy'),
(72, 'Can view Token', 18, 'view_tokenproxy');

-- --------------------------------------------------------

--
-- Table structure for table `bookings_booking`
--

CREATE TABLE `bookings_booking` (
  `id` bigint(20) NOT NULL,
  `booking_date` date NOT NULL,
  `booking_start_time` time(6) NOT NULL,
  `booking_end_time` time(6) NOT NULL,
  `estimated_duration` int(10) UNSIGNED NOT NULL CHECK (`estimated_duration` >= 0),
  `booking_status` varchar(20) NOT NULL,
  `qr_code` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `charger_id` bigint(20) NOT NULL,
  `station_id` bigint(20) NOT NULL,
  `trip_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `is_qr_used` tinyint(1) NOT NULL,
  `is_verified` tinyint(1) NOT NULL,
  `qr_image` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `bookings_booking`
--

INSERT INTO `bookings_booking` (`id`, `booking_date`, `booking_start_time`, `booking_end_time`, `estimated_duration`, `booking_status`, `qr_code`, `created_at`, `charger_id`, `station_id`, `trip_id`, `user_id`, `is_qr_used`, `is_verified`, `qr_image`) VALUES
(1, '2026-07-07', '23:43:44.000000', '00:20:00.000000', 25, 'COMPLETED', 'EV-BKG-92870E95F6', '2026-07-07 18:14:15.528422', 1, 1, 4, 2, 0, 0, 'booking_qr/booking_1.png'),
(2, '2026-07-09', '17:12:03.000000', '18:00:00.000000', 45, 'PENDING', 'EV-BKG-93B1DEE6EB', '2026-07-09 10:42:34.546687', 1, 1, 4, 2, 0, 0, 'booking_qr/booking_2.png'),
(3, '2026-07-09', '18:00:00.000000', '19:00:00.000000', 60, 'CONFIRMED', 'EV-BKG-3-7432AE', '2026-07-09 10:56:17.146472', 1, 1, 4, 2, 1, 0, 'booking_qr/booking_3.png'),
(4, '2026-07-09', '22:47:19.000000', '23:11:00.000000', 22, 'PENDING', 'EV-BKG-8987905607', '2026-07-09 17:17:41.394774', 1, 1, 4, 2, 0, 0, 'booking_qr/booking_4.png'),
(5, '2026-07-09', '22:52:03.000000', '22:52:04.000000', 20, 'PENDING', 'EV-BKG-3FFE3CE509', '2026-07-09 17:22:10.438137', 1, 1, 4, 2, 0, 0, 'booking_qr/booking_5.png'),
(6, '2026-07-09', '22:56:27.000000', '22:56:28.000000', 22, 'PENDING', 'EV-BKG-1106B8C294', '2026-07-09 17:26:33.174721', 1, 1, 4, 2, 0, 0, 'booking_qr/booking_6.png'),
(7, '2026-07-10', '18:00:00.000000', '19:00:00.000000', 60, 'COMPLETED', 'EV-BKG-7-7B2CB6', '2026-07-09 17:28:12.938572', 1, 1, 4, 2, 1, 0, 'booking_qr/booking_7.png'),
(8, '2026-07-10', '20:00:00.000000', '21:00:00.000000', 60, 'COMPLETED', 'EV-BKG-8-C39E20', '2026-07-09 17:45:08.984107', 1, 1, 4, 2, 1, 0, 'booking_qr/booking_8.png'),
(9, '2026-07-10', '19:00:00.000000', '20:00:00.000000', 60, 'COMPLETED', 'EV-BKG-9-A28004', '2026-07-09 18:09:34.014505', 1, 1, 4, 2, 1, 1, 'booking_qr/booking_9.png');

-- --------------------------------------------------------

--
-- Table structure for table `charging_charger`
--

CREATE TABLE `charging_charger` (
  `id` bigint(20) NOT NULL,
  `charger_name` varchar(50) NOT NULL,
  `charger_number` varchar(20) NOT NULL,
  `charger_type` varchar(10) NOT NULL,
  `connector_type` varchar(20) NOT NULL,
  `power_output_kw` decimal(6,2) NOT NULL,
  `voltage` int(10) UNSIGNED NOT NULL CHECK (`voltage` >= 0),
  `current` int(10) UNSIGNED NOT NULL CHECK (`current` >= 0),
  `price_per_kwh` decimal(8,2) NOT NULL,
  `status` varchar(20) NOT NULL,
  `installation_date` date NOT NULL,
  `last_maintenance` date DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `station_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `charging_charger`
--

INSERT INTO `charging_charger` (`id`, `charger_name`, `charger_number`, `charger_type`, `connector_type`, `power_output_kw`, `voltage`, `current`, `price_per_kwh`, `status`, `installation_date`, `last_maintenance`, `created_at`, `station_id`) VALUES
(1, 'AC-Fast', '01', 'AC', 'Type2', 65.00, 42, 410, 13.00, 'OCCUPIED', '2026-07-07', '2026-07-07', '2026-07-07 18:13:25.802932', 1),
(2, 'DC Fast Charger 1', 'CHG-GN-01', 'DC', 'CCS2', 50.00, 400, 125, 15.50, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:04:20.592540', 2),
(3, 'AC Charger 2', 'CHG-GN-02', 'AC', 'Type2', 7.20, 230, 32, 10.00, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:04:20.598416', 2),
(4, 'DC Super Charger 1', 'CHG-VD-01', 'DC', 'CCS2', 120.00, 800, 150, 18.00, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:04:20.615946', 3),
(5, 'DC Fast Charger 2', 'CHG-VD-02', 'DC', 'CCS2', 60.00, 400, 150, 16.00, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:04:20.621298', 3),
(6, 'DC Fast Charger 1', 'CHG-SR-01', 'DC', 'CCS2', 50.00, 400, 125, 15.00, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:04:20.632566', 4),
(7, 'DC Fast Charger 1', 'CHG-RJ-01', 'DC', 'CCS2', 50.00, 400, 125, 14.50, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:04:20.644601', 5),
(8, 'AC Charger 1', 'CHG-0006-1', 'AC', 'Type2', 7.20, 230, 32, 9.99, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:26.965122', 6),
(9, 'AC Charger 2', 'CHG-0006-2', 'AC', 'Type2', 22.00, 230, 32, 9.82, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:26.969593', 6),
(10, 'DC Charger 3', 'CHG-0006-3', 'DC', 'GB/T', 50.00, 400, 63, 11.71, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:26.976379', 6),
(11, 'DC Charger 4', 'CHG-0006-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.00, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:26.979470', 6),
(12, 'AC Charger 1', 'CHG-0007-1', 'AC', 'Type2', 11.00, 230, 32, 11.25, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:26.990673', 7),
(13, 'DC Charger 2', 'CHG-0007-2', 'DC', 'CCS2', 120.00, 400, 150, 17.43, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:26.994455', 7),
(14, 'AC Charger 3', 'CHG-0007-3', 'AC', 'Type2', 22.00, 230, 32, 11.07, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:26.998604', 7),
(15, 'DC Charger 4', 'CHG-0007-4', 'DC', 'GB/T', 50.00, 400, 63, 12.43, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.003945', 7),
(16, 'DC Charger 5', 'CHG-0007-5', 'DC', 'CCS2', 60.00, 400, 150, 14.57, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.009053', 7),
(17, 'DC Charger 1', 'CHG-0008-1', 'DC', 'CCS2', 60.00, 400, 150, 15.62, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.020606', 8),
(18, 'DC Charger 2', 'CHG-0008-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.62, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.025643', 8),
(19, 'DC Charger 3', 'CHG-0008-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.49, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.029919', 8),
(20, 'AC Charger 4', 'CHG-0008-4', 'AC', 'Type2', 22.00, 230, 32, 9.58, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.034470', 8),
(21, 'AC Charger 1', 'CHG-0009-1', 'AC', 'Type2', 11.00, 230, 32, 11.19, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.045046', 9),
(22, 'DC Charger 2', 'CHG-0009-2', 'DC', 'CCS2', 60.00, 400, 150, 14.93, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.049719', 9),
(23, 'DC Charger 3', 'CHG-0009-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.39, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.054327', 9),
(24, 'DC Charger 1', 'CHG-0010-1', 'DC', 'GB/T', 50.00, 400, 63, 11.35, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.064263', 10),
(25, 'DC Charger 2', 'CHG-0010-2', 'DC', 'CCS2', 150.00, 400, 150, 15.34, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.069583', 10),
(26, 'DC Charger 3', 'CHG-0010-3', 'DC', 'CCS2', 120.00, 400, 150, 17.10, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.074592', 10),
(27, 'DC Charger 4', 'CHG-0010-4', 'DC', 'GB/T', 15.00, 400, 63, 11.06, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.079986', 10),
(28, 'AC Charger 5', 'CHG-0010-5', 'AC', 'Type2', 22.00, 230, 32, 11.31, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.084857', 10),
(29, 'DC Charger 1', 'CHG-0011-1', 'DC', 'GB/T', 50.00, 400, 63, 11.97, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.095132', 11),
(30, 'DC Charger 2', 'CHG-0011-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.99, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.100078', 11),
(31, 'DC Charger 3', 'CHG-0011-3', 'DC', 'GB/T', 15.00, 400, 63, 12.03, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.105264', 11),
(32, 'DC Charger 4', 'CHG-0011-4', 'DC', 'GB/T', 50.00, 400, 63, 11.33, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.110019', 11),
(33, 'AC Charger 1', 'CHG-0012-1', 'AC', 'Type2', 22.00, 230, 32, 11.36, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.120130', 12),
(34, 'AC Charger 2', 'CHG-0012-2', 'AC', 'Type2', 7.20, 230, 32, 10.03, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.125099', 12),
(35, 'DC Charger 3', 'CHG-0012-3', 'DC', 'GB/T', 30.00, 400, 63, 10.71, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.130135', 12),
(36, 'AC Charger 4', 'CHG-0012-4', 'AC', 'Type2', 11.00, 230, 32, 10.22, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.135106', 12),
(37, 'DC Charger 1', 'CHG-0013-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.80, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.145720', 13),
(38, 'DC Charger 2', 'CHG-0013-2', 'DC', 'GB/T', 15.00, 400, 63, 13.40, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.150423', 13),
(39, 'DC Charger 3', 'CHG-0013-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.76, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.155957', 13),
(40, 'DC Charger 4', 'CHG-0013-4', 'DC', 'CCS2', 60.00, 400, 150, 14.65, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.160901', 13),
(41, 'DC Charger 5', 'CHG-0013-5', 'DC', 'CCS2', 60.00, 400, 150, 17.08, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.165538', 13),
(42, 'DC Charger 1', 'CHG-0014-1', 'DC', 'CCS2', 150.00, 400, 150, 16.38, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.177036', 14),
(43, 'DC Charger 2', 'CHG-0014-2', 'DC', 'CCS2', 50.00, 400, 150, 16.25, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.182021', 14),
(44, 'DC Charger 3', 'CHG-0014-3', 'DC', 'CCS2', 50.00, 400, 150, 15.68, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.187282', 14),
(45, 'AC Charger 1', 'CHG-0015-1', 'AC', 'Type2', 22.00, 230, 32, 10.33, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.197841', 15),
(46, 'DC Charger 2', 'CHG-0015-2', 'DC', 'CCS2', 50.00, 400, 150, 14.60, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.203703', 15),
(47, 'AC Charger 3', 'CHG-0015-3', 'AC', 'Type2', 11.00, 230, 32, 8.61, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.208432', 15),
(48, 'DC Charger 4', 'CHG-0015-4', 'DC', 'CCS2', 150.00, 400, 150, 16.35, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.213332', 15),
(49, 'DC Charger 1', 'CHG-0016-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.44, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.224124', 16),
(50, 'DC Charger 2', 'CHG-0016-2', 'DC', 'CCS2', 150.00, 400, 150, 16.83, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.228847', 16),
(51, 'AC Charger 1', 'CHG-0017-1', 'AC', 'Type2', 22.00, 230, 32, 10.78, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.239376', 17),
(52, 'DC Charger 2', 'CHG-0017-2', 'DC', 'CCS2', 120.00, 400, 150, 17.40, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.243897', 17),
(53, 'DC Charger 3', 'CHG-0017-3', 'DC', 'CCS2', 50.00, 400, 150, 15.17, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.249044', 17),
(54, 'DC Charger 1', 'CHG-0018-1', 'DC', 'CCS2', 50.00, 400, 150, 15.40, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.260325', 18),
(55, 'DC Charger 2', 'CHG-0018-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.33, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.265154', 18),
(56, 'DC Charger 3', 'CHG-0018-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.01, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.270140', 18),
(57, 'DC Charger 4', 'CHG-0018-4', 'DC', 'GB/T', 50.00, 400, 63, 11.09, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.275600', 18),
(58, 'DC Charger 1', 'CHG-0019-1', 'DC', 'GB/T', 30.00, 400, 63, 12.69, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.288897', 19),
(59, 'DC Charger 2', 'CHG-0019-2', 'DC', 'GB/T', 30.00, 400, 63, 12.60, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.297767', 19),
(60, 'AC Charger 3', 'CHG-0019-3', 'AC', 'Type2', 22.00, 230, 32, 11.37, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.303983', 19),
(61, 'DC Charger 1', 'CHG-0020-1', 'DC', 'CCS2', 150.00, 400, 150, 16.64, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.319555', 20),
(62, 'AC Charger 2', 'CHG-0020-2', 'AC', 'Type2', 22.00, 230, 32, 9.44, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.324482', 20),
(63, 'DC Charger 1', 'CHG-0021-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.28, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.334544', 21),
(64, 'AC Charger 2', 'CHG-0021-2', 'AC', 'Type2', 11.00, 230, 32, 9.67, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.339812', 21),
(65, 'AC Charger 3', 'CHG-0021-3', 'AC', 'Type2', 22.00, 230, 32, 10.39, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.344730', 21),
(66, 'DC Charger 1', 'CHG-0022-1', 'DC', 'GB/T', 50.00, 400, 63, 11.13, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.354278', 22),
(67, 'DC Charger 2', 'CHG-0022-2', 'DC', 'CCS2', 120.00, 400, 150, 17.45, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.359543', 22),
(68, 'DC Charger 3', 'CHG-0022-3', 'DC', 'CCS2', 150.00, 400, 150, 15.80, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.364389', 22),
(69, 'DC Charger 4', 'CHG-0022-4', 'DC', 'CCS2', 150.00, 400, 150, 15.61, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.369120', 22),
(70, 'DC Charger 1', 'CHG-0023-1', 'DC', 'GB/T', 15.00, 400, 63, 12.06, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.379095', 23),
(71, 'DC Charger 2', 'CHG-0023-2', 'DC', 'GB/T', 15.00, 400, 63, 12.01, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.383502', 23),
(72, 'AC Charger 3', 'CHG-0023-3', 'AC', 'Type2', 22.00, 230, 32, 11.14, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.388239', 23),
(73, 'AC Charger 1', 'CHG-0024-1', 'AC', 'Type2', 11.00, 230, 32, 10.33, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.398816', 24),
(74, 'DC Charger 2', 'CHG-0024-2', 'DC', 'GB/T', 30.00, 400, 63, 12.98, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.403107', 24),
(75, 'DC Charger 3', 'CHG-0024-3', 'DC', 'GB/T', 30.00, 400, 63, 12.52, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.407246', 24),
(76, 'DC Charger 4', 'CHG-0024-4', 'DC', 'GB/T', 50.00, 400, 63, 12.65, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.411844', 24),
(77, 'DC Charger 1', 'CHG-0025-1', 'DC', 'CCS2', 60.00, 400, 150, 15.28, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.420481', 25),
(78, 'DC Charger 2', 'CHG-0025-2', 'DC', 'GB/T', 50.00, 400, 63, 12.79, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.424813', 25),
(79, 'DC Charger 3', 'CHG-0025-3', 'DC', 'CCS2', 150.00, 400, 150, 15.98, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.429378', 25),
(80, 'DC Charger 4', 'CHG-0025-4', 'DC', 'GB/T', 30.00, 400, 63, 13.41, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.434335', 25),
(81, 'DC Charger 1', 'CHG-0026-1', 'DC', 'GB/T', 50.00, 400, 63, 12.46, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.443479', 26),
(82, 'AC Charger 2', 'CHG-0026-2', 'AC', 'Type2', 11.00, 230, 32, 10.93, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.447954', 26),
(83, 'DC Charger 3', 'CHG-0026-3', 'DC', 'CCS2', 150.00, 400, 150, 14.84, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.452677', 26),
(84, 'DC Charger 4', 'CHG-0026-4', 'DC', 'GB/T', 30.00, 400, 63, 11.75, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.456998', 26),
(85, 'DC Charger 5', 'CHG-0026-5', 'DC', 'CCS2', 120.00, 400, 150, 15.51, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.460893', 26),
(86, 'DC Charger 1', 'CHG-0027-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.32, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.470055', 27),
(87, 'DC Charger 2', 'CHG-0027-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.30, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.474333', 27),
(88, 'DC Charger 3', 'CHG-0027-3', 'DC', 'GB/T', 15.00, 400, 63, 10.57, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.478683', 27),
(89, 'AC Charger 4', 'CHG-0027-4', 'AC', 'Type2', 7.20, 230, 32, 8.63, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.483377', 27),
(90, 'DC Charger 5', 'CHG-0027-5', 'DC', 'CCS2', 50.00, 400, 150, 17.10, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.487141', 27),
(91, 'DC Charger 1', 'CHG-0028-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.25, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.496079', 28),
(92, 'DC Charger 2', 'CHG-0028-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.71, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.499998', 28),
(93, 'DC Charger 3', 'CHG-0028-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.75, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.503750', 28),
(94, 'DC Charger 4', 'CHG-0028-4', 'DC', 'GB/T', 15.00, 400, 63, 11.14, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.507986', 28),
(95, 'AC Charger 5', 'CHG-0028-5', 'AC', 'Type2', 11.00, 230, 32, 10.65, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.512373', 28),
(96, 'DC Charger 1', 'CHG-0029-1', 'DC', 'CCS2', 120.00, 400, 150, 16.25, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.520488', 29),
(97, 'AC Charger 2', 'CHG-0029-2', 'AC', 'Type2', 11.00, 230, 32, 9.59, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.524611', 29),
(98, 'DC Charger 3', 'CHG-0029-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.08, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.528862', 29),
(99, 'DC Charger 4', 'CHG-0029-4', 'DC', 'GB/T', 15.00, 400, 63, 12.93, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.532683', 29),
(100, 'DC Charger 5', 'CHG-0029-5', 'DC', 'GB/T', 50.00, 400, 63, 10.70, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.536467', 29),
(101, 'DC Charger 1', 'CHG-0030-1', 'DC', 'GB/T', 15.00, 400, 63, 11.75, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.546163', 30),
(102, 'DC Charger 2', 'CHG-0030-2', 'DC', 'CCS2', 60.00, 400, 150, 15.94, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.550272', 30),
(103, 'DC Charger 3', 'CHG-0030-3', 'DC', 'GB/T', 30.00, 400, 63, 12.04, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.554203', 30),
(104, 'DC Charger 1', 'CHG-0031-1', 'DC', 'CCS2', 150.00, 400, 150, 15.62, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.562703', 31),
(105, 'DC Charger 2', 'CHG-0031-2', 'DC', 'GB/T', 30.00, 400, 63, 11.14, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.566684', 31),
(106, 'DC Charger 1', 'CHG-0032-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.60, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.575033', 32),
(107, 'AC Charger 2', 'CHG-0032-2', 'AC', 'Type2', 11.00, 230, 32, 8.85, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.578931', 32),
(108, 'AC Charger 3', 'CHG-0032-3', 'AC', 'Type2', 11.00, 230, 32, 8.54, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.582972', 32),
(109, 'DC Charger 4', 'CHG-0032-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.34, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.587094', 32),
(110, 'DC Charger 5', 'CHG-0032-5', 'DC', 'GB/T', 50.00, 400, 63, 10.50, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.591163', 32),
(111, 'DC Charger 1', 'CHG-0033-1', 'DC', 'GB/T', 15.00, 400, 63, 12.06, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.599204', 33),
(112, 'DC Charger 2', 'CHG-0033-2', 'DC', 'GB/T', 30.00, 400, 63, 11.71, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.603015', 33),
(113, 'DC Charger 3', 'CHG-0033-3', 'DC', 'CCS2', 150.00, 400, 150, 15.85, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.607348', 33),
(114, 'DC Charger 1', 'CHG-0034-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.99, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.615436', 34),
(115, 'DC Charger 2', 'CHG-0034-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.90, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.619483', 34),
(116, 'DC Charger 3', 'CHG-0034-3', 'DC', 'CCS2', 50.00, 400, 150, 17.13, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.623757', 34),
(117, 'DC Charger 4', 'CHG-0034-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.92, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.627761', 34),
(118, 'DC Charger 5', 'CHG-0034-5', 'DC', 'CCS2', 50.00, 400, 150, 16.19, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.631675', 34),
(119, 'AC Charger 1', 'CHG-0035-1', 'AC', 'Type2', 11.00, 230, 32, 11.04, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.640519', 35),
(120, 'DC Charger 2', 'CHG-0035-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.20, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.644221', 35),
(121, 'DC Charger 3', 'CHG-0035-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.38, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.648151', 35),
(122, 'DC Charger 4', 'CHG-0035-4', 'DC', 'CCS2', 50.00, 400, 150, 15.95, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.652317', 35),
(123, 'DC Charger 1', 'CHG-0036-1', 'DC', 'CCS2', 50.00, 400, 150, 16.46, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.661230', 36),
(124, 'DC Charger 2', 'CHG-0036-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.93, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.665162', 36),
(125, 'DC Charger 3', 'CHG-0036-3', 'DC', 'CCS2', 50.00, 400, 150, 16.48, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.669291', 36),
(126, 'DC Charger 4', 'CHG-0036-4', 'DC', 'CCS2', 150.00, 400, 150, 16.06, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.673495', 36),
(127, 'AC Charger 1', 'CHG-0037-1', 'AC', 'Type2', 7.20, 230, 32, 9.36, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.681862', 37),
(128, 'DC Charger 2', 'CHG-0037-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.53, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.686009', 37),
(129, 'DC Charger 3', 'CHG-0037-3', 'DC', 'GB/T', 30.00, 400, 63, 10.62, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.690370', 37),
(130, 'DC Charger 4', 'CHG-0037-4', 'DC', 'CCS2', 60.00, 400, 150, 15.62, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.694468', 37),
(131, 'DC Charger 1', 'CHG-0038-1', 'DC', 'CCS2', 50.00, 400, 150, 17.06, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.703245', 38),
(132, 'DC Charger 2', 'CHG-0038-2', 'DC', 'CCS2', 120.00, 400, 150, 14.82, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.707853', 38),
(133, 'DC Charger 1', 'CHG-0039-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.35, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.717017', 39),
(134, 'DC Charger 2', 'CHG-0039-2', 'DC', 'CCS2', 150.00, 400, 150, 15.96, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.722418', 39),
(135, 'DC Charger 3', 'CHG-0039-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.97, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.726656', 39),
(136, 'DC Charger 4', 'CHG-0039-4', 'DC', 'CCS2', 120.00, 400, 150, 15.94, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.730439', 39),
(137, 'DC Charger 5', 'CHG-0039-5', 'DC', 'CCS2', 50.00, 400, 150, 15.26, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.734115', 39),
(138, 'DC Charger 1', 'CHG-0040-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.39, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.742722', 40),
(139, 'DC Charger 2', 'CHG-0040-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.13, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.746663', 40),
(140, 'DC Charger 1', 'CHG-0041-1', 'DC', 'GB/T', 50.00, 400, 63, 11.95, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.755280', 41),
(141, 'DC Charger 2', 'CHG-0041-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.52, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.759680', 41),
(142, 'DC Charger 3', 'CHG-0041-3', 'DC', 'CCS2', 150.00, 400, 150, 16.08, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.765494', 41),
(143, 'DC Charger 4', 'CHG-0041-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.53, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.770371', 41),
(144, 'DC Charger 5', 'CHG-0041-5', 'DC', 'CCS2', 120.00, 400, 150, 16.51, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.774856', 41),
(145, 'AC Charger 1', 'CHG-0042-1', 'AC', 'Type2', 11.00, 230, 32, 9.08, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.783374', 42),
(146, 'DC Charger 2', 'CHG-0042-2', 'DC', 'CCS2', 50.00, 400, 150, 16.22, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.787851', 42),
(147, 'DC Charger 3', 'CHG-0042-3', 'DC', 'GB/T', 15.00, 400, 63, 11.84, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.794769', 42),
(148, 'DC Charger 4', 'CHG-0042-4', 'DC', 'GB/T', 30.00, 400, 63, 10.80, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.798990', 42),
(149, 'AC Charger 1', 'CHG-0043-1', 'AC', 'Type2', 11.00, 230, 32, 10.53, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.807962', 43),
(150, 'DC Charger 2', 'CHG-0043-2', 'DC', 'GB/T', 15.00, 400, 63, 12.40, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.811950', 43),
(151, 'DC Charger 3', 'CHG-0043-3', 'DC', 'GB/T', 50.00, 400, 63, 11.39, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.815745', 43),
(152, 'AC Charger 4', 'CHG-0043-4', 'AC', 'Type2', 22.00, 230, 32, 11.44, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.820043', 43),
(153, 'DC Charger 1', 'CHG-0044-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.03, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.828500', 44),
(154, 'DC Charger 2', 'CHG-0044-2', 'DC', 'CCS2', 150.00, 400, 150, 15.67, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.832261', 44),
(155, 'DC Charger 1', 'CHG-0045-1', 'DC', 'GB/T', 30.00, 400, 63, 12.68, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.839929', 45),
(156, 'DC Charger 2', 'CHG-0045-2', 'DC', 'CCS2', 120.00, 400, 150, 15.45, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.843928', 45),
(157, 'DC Charger 3', 'CHG-0045-3', 'DC', 'GB/T', 50.00, 400, 63, 12.59, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.847962', 45),
(158, 'AC Charger 4', 'CHG-0045-4', 'AC', 'Type2', 22.00, 230, 32, 9.89, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.852044', 45),
(159, 'AC Charger 1', 'CHG-0046-1', 'AC', 'Type2', 7.20, 230, 32, 11.18, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.860813', 46),
(160, 'DC Charger 2', 'CHG-0046-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.74, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.864526', 46),
(161, 'DC Charger 3', 'CHG-0046-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.60, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.868566', 46),
(162, 'DC Charger 4', 'CHG-0046-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.10, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.872866', 46),
(163, 'DC Charger 5', 'CHG-0046-5', 'DC', 'GB/T', 30.00, 400, 63, 11.64, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.877002', 46),
(164, 'DC Charger 1', 'CHG-0047-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.60, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.885541', 47),
(165, 'DC Charger 2', 'CHG-0047-2', 'DC', 'GB/T', 30.00, 400, 63, 11.16, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.889362', 47),
(166, 'DC Charger 1', 'CHG-0048-1', 'DC', 'GB/T', 50.00, 400, 63, 11.07, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.897300', 48),
(167, 'DC Charger 2', 'CHG-0048-2', 'DC', 'GB/T', 50.00, 400, 63, 13.03, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.901485', 48),
(168, 'DC Charger 3', 'CHG-0048-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.37, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.905636', 48),
(169, 'AC Charger 1', 'CHG-0049-1', 'AC', 'Type2', 7.20, 230, 32, 9.52, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.914047', 49),
(170, 'AC Charger 2', 'CHG-0049-2', 'AC', 'Type2', 11.00, 230, 32, 10.15, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.917761', 49),
(171, 'DC Charger 3', 'CHG-0049-3', 'DC', 'GB/T', 30.00, 400, 63, 12.74, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.921804', 49),
(172, 'AC Charger 4', 'CHG-0049-4', 'AC', 'Type2', 11.00, 230, 32, 9.97, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.926021', 49),
(173, 'DC Charger 5', 'CHG-0049-5', 'DC', 'CCS2', 120.00, 400, 150, 16.80, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.929893', 49),
(174, 'DC Charger 1', 'CHG-0050-1', 'DC', 'GB/T', 15.00, 400, 63, 10.72, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.939207', 50),
(175, 'DC Charger 2', 'CHG-0050-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.36, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.943317', 50),
(176, 'DC Charger 3', 'CHG-0050-3', 'DC', 'GB/T', 50.00, 400, 63, 11.88, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.947279', 50),
(177, 'DC Charger 4', 'CHG-0050-4', 'DC', 'GB/T', 30.00, 400, 63, 11.91, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.951768', 50),
(178, 'DC Charger 1', 'CHG-0051-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.64, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.960351', 51),
(179, 'DC Charger 2', 'CHG-0051-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.57, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.964101', 51),
(180, 'DC Charger 3', 'CHG-0051-3', 'DC', 'CCS2', 150.00, 400, 150, 17.29, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.968374', 51),
(181, 'DC Charger 4', 'CHG-0051-4', 'DC', 'GB/T', 50.00, 400, 63, 11.07, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.972498', 51),
(182, 'DC Charger 1', 'CHG-0052-1', 'DC', 'CCS2', 60.00, 400, 150, 17.35, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.981110', 52),
(183, 'DC Charger 2', 'CHG-0052-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.55, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.985271', 52),
(184, 'DC Charger 3', 'CHG-0052-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.28, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.989435', 52),
(185, 'AC Charger 1', 'CHG-0053-1', 'AC', 'Type2', 22.00, 230, 32, 10.95, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:27.997383', 53),
(186, 'AC Charger 2', 'CHG-0053-2', 'AC', 'Type2', 11.00, 230, 32, 9.27, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.001247', 53),
(187, 'AC Charger 3', 'CHG-0053-3', 'AC', 'Type2', 7.20, 230, 32, 9.43, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.005833', 53),
(188, 'DC Charger 1', 'CHG-0054-1', 'DC', 'GB/T', 50.00, 400, 63, 10.83, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.015032', 54),
(189, 'DC Charger 2', 'CHG-0054-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.94, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.019676', 54),
(190, 'DC Charger 3', 'CHG-0054-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.57, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.023995', 54),
(191, 'DC Charger 4', 'CHG-0054-4', 'DC', 'GB/T', 50.00, 400, 63, 13.37, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.028255', 54),
(192, 'DC Charger 1', 'CHG-0055-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.40, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.037193', 55),
(193, 'AC Charger 2', 'CHG-0055-2', 'AC', 'Type2', 22.00, 230, 32, 10.40, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.041349', 55),
(194, 'DC Charger 1', 'CHG-0056-1', 'DC', 'GB/T', 15.00, 400, 63, 10.60, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.049684', 56),
(195, 'DC Charger 2', 'CHG-0056-2', 'DC', 'GB/T', 50.00, 400, 63, 12.54, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.054148', 56),
(196, 'DC Charger 3', 'CHG-0056-3', 'DC', 'CCS2', 120.00, 400, 150, 17.16, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.058442', 56),
(197, 'AC Charger 4', 'CHG-0056-4', 'AC', 'Type2', 22.00, 230, 32, 9.99, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.062580', 56),
(198, 'DC Charger 1', 'CHG-0057-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.80, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.071566', 57),
(199, 'AC Charger 2', 'CHG-0057-2', 'AC', 'Type2', 11.00, 230, 32, 9.01, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.077287', 57),
(200, 'DC Charger 3', 'CHG-0057-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.51, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.081617', 57),
(201, 'DC Charger 4', 'CHG-0057-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.11, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.086770', 57),
(202, 'AC Charger 5', 'CHG-0057-5', 'AC', 'Type2', 11.00, 230, 32, 9.46, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.091719', 57),
(203, 'AC Charger 1', 'CHG-0058-1', 'AC', 'Type2', 7.20, 230, 32, 10.26, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.101475', 58),
(204, 'AC Charger 2', 'CHG-0058-2', 'AC', 'Type2', 22.00, 230, 32, 8.65, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.106167', 58),
(205, 'DC Charger 3', 'CHG-0058-3', 'DC', 'CCS2', 60.00, 400, 150, 17.04, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.110666', 58),
(206, 'AC Charger 1', 'CHG-0059-1', 'AC', 'Type2', 7.20, 230, 32, 9.88, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.120229', 59),
(207, 'DC Charger 2', 'CHG-0059-2', 'DC', 'CCS2', 50.00, 400, 150, 16.32, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.124408', 59),
(208, 'AC Charger 3', 'CHG-0059-3', 'AC', 'Type2', 22.00, 230, 32, 8.75, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.128973', 59),
(209, 'DC Charger 1', 'CHG-0060-1', 'DC', 'CCS2', 150.00, 400, 150, 16.14, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.141516', 60),
(210, 'AC Charger 2', 'CHG-0060-2', 'AC', 'Type2', 7.20, 230, 32, 10.65, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.146082', 60),
(211, 'DC Charger 3', 'CHG-0060-3', 'DC', 'GB/T', 15.00, 400, 63, 12.91, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.150635', 60),
(212, 'AC Charger 1', 'CHG-0061-1', 'AC', 'Type2', 7.20, 230, 32, 8.74, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.159566', 61),
(213, 'DC Charger 2', 'CHG-0061-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.99, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.163503', 61),
(214, 'DC Charger 3', 'CHG-0061-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.47, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.167592', 61),
(215, 'DC Charger 4', 'CHG-0061-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.49, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.171986', 61),
(216, 'DC Charger 1', 'CHG-0062-1', 'DC', 'CCS2', 150.00, 400, 150, 16.86, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.180722', 62),
(217, 'DC Charger 2', 'CHG-0062-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.28, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.185071', 62),
(218, 'AC Charger 3', 'CHG-0062-3', 'AC', 'Type2', 11.00, 230, 32, 10.03, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.189607', 62),
(219, 'DC Charger 1', 'CHG-0063-1', 'DC', 'GB/T', 30.00, 400, 63, 11.45, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.199539', 63),
(220, 'DC Charger 2', 'CHG-0063-2', 'DC', 'GB/T', 50.00, 400, 63, 11.18, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.203931', 63),
(221, 'DC Charger 3', 'CHG-0063-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.06, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.208332', 63),
(222, 'DC Charger 4', 'CHG-0063-4', 'DC', 'CCS2', 50.00, 400, 150, 16.50, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.212632', 63),
(223, 'DC Charger 5', 'CHG-0063-5', 'DC', 'GB/T', 30.00, 400, 63, 13.43, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.216865', 63),
(224, 'DC Charger 1', 'CHG-0064-1', 'DC', 'GB/T', 15.00, 400, 63, 12.68, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.227405', 64),
(225, 'DC Charger 2', 'CHG-0064-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.64, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.232082', 64),
(226, 'DC Charger 3', 'CHG-0064-3', 'DC', 'GB/T', 50.00, 400, 63, 12.43, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.237138', 64),
(227, 'AC Charger 1', 'CHG-0065-1', 'AC', 'Type2', 22.00, 230, 32, 11.23, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.246741', 65),
(228, 'DC Charger 2', 'CHG-0065-2', 'DC', 'GB/T', 30.00, 400, 63, 12.70, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.251117', 65),
(229, 'AC Charger 3', 'CHG-0065-3', 'AC', 'Type2', 7.20, 230, 32, 9.80, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.255950', 65),
(230, 'DC Charger 1', 'CHG-0066-1', 'DC', 'GB/T', 30.00, 400, 63, 13.41, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.265149', 66),
(231, 'DC Charger 2', 'CHG-0066-2', 'DC', 'GB/T', 50.00, 400, 63, 13.03, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.269654', 66),
(232, 'DC Charger 1', 'CHG-0067-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.37, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.279974', 67),
(233, 'DC Charger 2', 'CHG-0067-2', 'DC', 'GB/T', 15.00, 400, 63, 11.40, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.284726', 67),
(234, 'DC Charger 3', 'CHG-0067-3', 'DC', 'GB/T', 30.00, 400, 63, 11.63, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.289850', 67),
(235, 'AC Charger 1', 'CHG-0068-1', 'AC', 'Type2', 11.00, 230, 32, 8.81, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.306666', 68),
(236, 'DC Charger 2', 'CHG-0068-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.99, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.310887', 68),
(237, 'DC Charger 3', 'CHG-0068-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.67, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.315100', 68),
(238, 'AC Charger 4', 'CHG-0068-4', 'AC', 'Type2', 22.00, 230, 32, 10.28, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.319582', 68),
(239, 'AC Charger 1', 'CHG-0069-1', 'AC', 'Type2', 22.00, 230, 32, 8.68, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.330050', 69),
(240, 'AC Charger 2', 'CHG-0069-2', 'AC', 'Type2', 7.20, 230, 32, 10.34, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.336595', 69),
(241, 'DC Charger 1', 'CHG-0070-1', 'DC', 'GB/T', 15.00, 400, 63, 13.31, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.346541', 70),
(242, 'DC Charger 2', 'CHG-0070-2', 'DC', 'CCS2', 150.00, 400, 150, 14.91, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.351325', 70),
(243, 'DC Charger 3', 'CHG-0070-3', 'DC', 'GB/T', 50.00, 400, 63, 12.89, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.356621', 70),
(244, 'DC Charger 4', 'CHG-0070-4', 'DC', 'CCS2', 50.00, 400, 150, 17.40, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.361380', 70),
(245, 'DC Charger 5', 'CHG-0070-5', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.39, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.365717', 70),
(246, 'DC Charger 1', 'CHG-0071-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.26, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.376093', 71),
(247, 'DC Charger 2', 'CHG-0071-2', 'DC', 'CCS2', 50.00, 400, 150, 17.10, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.380784', 71),
(248, 'AC Charger 3', 'CHG-0071-3', 'AC', 'Type2', 7.20, 230, 32, 11.06, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.385320', 71),
(249, 'DC Charger 4', 'CHG-0071-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.20, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.389985', 71),
(250, 'DC Charger 5', 'CHG-0071-5', 'DC', 'CCS2', 120.00, 400, 150, 17.06, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.394565', 71),
(251, 'DC Charger 1', 'CHG-0072-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.71, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.403978', 72),
(252, 'DC Charger 2', 'CHG-0072-2', 'DC', 'GB/T', 50.00, 400, 63, 11.50, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.408439', 72),
(253, 'DC Charger 3', 'CHG-0072-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.02, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.412478', 72),
(254, 'DC Charger 4', 'CHG-0072-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.26, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.416083', 72),
(255, 'AC Charger 1', 'CHG-0073-1', 'AC', 'Type2', 11.00, 230, 32, 9.81, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.425779', 73),
(256, 'AC Charger 2', 'CHG-0073-2', 'AC', 'Type2', 7.20, 230, 32, 8.66, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.430067', 73),
(257, 'DC Charger 3', 'CHG-0073-3', 'DC', 'GB/T', 50.00, 400, 63, 12.39, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.434537', 73),
(258, 'DC Charger 1', 'CHG-0074-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.82, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.443844', 74),
(259, 'DC Charger 2', 'CHG-0074-2', 'DC', 'CCS2', 50.00, 400, 150, 16.59, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.448007', 74),
(260, 'DC Charger 3', 'CHG-0074-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.65, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.452286', 74),
(261, 'AC Charger 1', 'CHG-0075-1', 'AC', 'Type2', 7.20, 230, 32, 11.04, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.461369', 75),
(262, 'DC Charger 2', 'CHG-0075-2', 'DC', 'GB/T', 50.00, 400, 63, 11.70, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.465506', 75),
(263, 'DC Charger 3', 'CHG-0075-3', 'DC', 'GB/T', 30.00, 400, 63, 12.77, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.469726', 75),
(264, 'DC Charger 1', 'CHG-0076-1', 'DC', 'CCS2', 120.00, 400, 150, 17.14, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.479088', 76),
(265, 'DC Charger 2', 'CHG-0076-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.60, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.483612', 76),
(266, 'DC Charger 1', 'CHG-0077-1', 'DC', 'GB/T', 50.00, 400, 63, 11.69, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.492915', 77),
(267, 'DC Charger 2', 'CHG-0077-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.35, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.497299', 77),
(268, 'DC Charger 1', 'CHG-0078-1', 'DC', 'GB/T', 30.00, 400, 63, 11.24, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.507281', 78),
(269, 'DC Charger 2', 'CHG-0078-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.13, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.511906', 78),
(270, 'AC Charger 3', 'CHG-0078-3', 'AC', 'Type2', 7.20, 230, 32, 9.81, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.516229', 78),
(271, 'DC Charger 4', 'CHG-0078-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.14, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.520661', 78),
(272, 'DC Charger 1', 'CHG-0079-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.08, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.530130', 79),
(273, 'DC Charger 2', 'CHG-0079-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.87, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.534952', 79),
(274, 'DC Charger 3', 'CHG-0079-3', 'DC', 'GB/T', 30.00, 400, 63, 12.56, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.539723', 79),
(275, 'AC Charger 4', 'CHG-0079-4', 'AC', 'Type2', 22.00, 230, 32, 9.61, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.543775', 79),
(276, 'DC Charger 1', 'CHG-0080-1', 'DC', 'CCS2', 150.00, 400, 150, 16.09, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.550796', 80),
(277, 'DC Charger 2', 'CHG-0080-2', 'DC', 'CCS2', 60.00, 400, 150, 15.75, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.554037', 80),
(278, 'DC Charger 3', 'CHG-0080-3', 'DC', 'CCS2', 150.00, 400, 150, 16.68, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.557674', 80),
(279, 'DC Charger 4', 'CHG-0080-4', 'DC', 'GB/T', 50.00, 400, 63, 12.57, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.561075', 80),
(280, 'DC Charger 5', 'CHG-0080-5', 'DC', 'CCS2', 120.00, 400, 150, 14.96, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.565404', 80),
(281, 'DC Charger 1', 'CHG-0081-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.67, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.574897', 81),
(282, 'DC Charger 2', 'CHG-0081-2', 'DC', 'GB/T', 30.00, 400, 63, 10.74, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.579753', 81),
(283, 'DC Charger 3', 'CHG-0081-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.35, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.584550', 81),
(284, 'AC Charger 4', 'CHG-0081-4', 'AC', 'Type2', 11.00, 230, 32, 9.03, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.589381', 81),
(285, 'AC Charger 5', 'CHG-0081-5', 'AC', 'Type2', 11.00, 230, 32, 9.97, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.594017', 81),
(286, 'DC Charger 1', 'CHG-0082-1', 'DC', 'GB/T', 30.00, 400, 63, 13.09, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.603571', 82),
(287, 'DC Charger 2', 'CHG-0082-2', 'DC', 'CCS2', 150.00, 400, 150, 16.69, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.608163', 82),
(288, 'AC Charger 1', 'CHG-0083-1', 'AC', 'Type2', 11.00, 230, 32, 8.93, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.617451', 83),
(289, 'DC Charger 2', 'CHG-0083-2', 'DC', 'CCS2', 60.00, 400, 150, 15.63, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.622694', 83),
(290, 'DC Charger 3', 'CHG-0083-3', 'DC', 'CCS2', 60.00, 400, 150, 16.68, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.627594', 83),
(291, 'AC Charger 4', 'CHG-0083-4', 'AC', 'Type2', 11.00, 230, 32, 9.59, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.632671', 83),
(292, 'DC Charger 5', 'CHG-0083-5', 'DC', 'CCS2', 60.00, 400, 150, 17.15, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.637752', 83),
(293, 'DC Charger 1', 'CHG-0084-1', 'DC', 'GB/T', 50.00, 400, 63, 12.61, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.647459', 84),
(294, 'AC Charger 2', 'CHG-0084-2', 'AC', 'Type2', 22.00, 230, 32, 10.92, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.652231', 84),
(295, 'AC Charger 1', 'CHG-0085-1', 'AC', 'Type2', 11.00, 230, 32, 10.49, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.662552', 85),
(296, 'DC Charger 2', 'CHG-0085-2', 'DC', 'CCS2', 120.00, 400, 150, 17.43, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.666785', 85),
(297, 'DC Charger 3', 'CHG-0085-3', 'DC', 'CCS2', 120.00, 400, 150, 14.54, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.671217', 85),
(298, 'DC Charger 4', 'CHG-0085-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.82, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.675871', 85),
(299, 'DC Charger 1', 'CHG-0086-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.54, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.684898', 86),
(300, 'DC Charger 2', 'CHG-0086-2', 'DC', 'CCS2', 60.00, 400, 150, 15.88, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.688978', 86),
(301, 'AC Charger 3', 'CHG-0086-3', 'AC', 'Type2', 11.00, 230, 32, 8.63, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.693830', 86),
(302, 'DC Charger 4', 'CHG-0086-4', 'DC', 'CCS2', 150.00, 400, 150, 17.00, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.698265', 86),
(303, 'DC Charger 5', 'CHG-0086-5', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.78, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.702852', 86),
(304, 'AC Charger 1', 'CHG-0087-1', 'AC', 'Type2', 7.20, 230, 32, 9.06, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.712391', 87),
(305, 'DC Charger 2', 'CHG-0087-2', 'DC', 'CCS2', 150.00, 400, 150, 14.79, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.716758', 87),
(306, 'DC Charger 3', 'CHG-0087-3', 'DC', 'CCS2', 150.00, 400, 150, 16.67, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.720501', 87),
(307, 'DC Charger 4', 'CHG-0087-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.78, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.725177', 87),
(308, 'DC Charger 5', 'CHG-0087-5', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.63, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.729369', 87),
(309, 'AC Charger 1', 'CHG-0088-1', 'AC', 'Type2', 11.00, 230, 32, 9.02, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.741072', 88),
(310, 'DC Charger 2', 'CHG-0088-2', 'DC', 'GB/T', 50.00, 400, 63, 11.84, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.745420', 88),
(311, 'AC Charger 3', 'CHG-0088-3', 'AC', 'Type2', 22.00, 230, 32, 11.02, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.749883', 88),
(312, 'DC Charger 1', 'CHG-0089-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.90, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.759314', 89),
(313, 'DC Charger 2', 'CHG-0089-2', 'DC', 'CCS2', 60.00, 400, 150, 16.15, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.764183', 89),
(314, 'AC Charger 1', 'CHG-0090-1', 'AC', 'Type2', 11.00, 230, 32, 9.48, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.775000', 90),
(315, 'DC Charger 2', 'CHG-0090-2', 'DC', 'CCS2', 120.00, 400, 150, 15.93, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.779564', 90),
(316, 'DC Charger 3', 'CHG-0090-3', 'DC', 'CCS2', 150.00, 400, 150, 15.69, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.784243', 90),
(317, 'DC Charger 1', 'CHG-0091-1', 'DC', 'CCS2', 60.00, 400, 150, 17.03, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.793888', 91),
(318, 'DC Charger 2', 'CHG-0091-2', 'DC', 'CCS2', 120.00, 400, 150, 15.89, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.798884', 91),
(319, 'DC Charger 3', 'CHG-0091-3', 'DC', 'CCS2', 60.00, 400, 150, 16.98, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.804044', 91),
(320, 'DC Charger 4', 'CHG-0091-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.86, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.808737', 91),
(321, 'DC Charger 1', 'CHG-0092-1', 'DC', 'CCS2', 60.00, 400, 150, 17.06, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.818634', 92),
(322, 'DC Charger 2', 'CHG-0092-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.53, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.823715', 92),
(323, 'AC Charger 1', 'CHG-0093-1', 'AC', 'Type2', 7.20, 230, 32, 10.34, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.832642', 93),
(324, 'DC Charger 2', 'CHG-0093-2', 'DC', 'GB/T', 50.00, 400, 63, 10.90, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.837112', 93),
(325, 'DC Charger 1', 'CHG-0094-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.03, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.845838', 94),
(326, 'DC Charger 2', 'CHG-0094-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.98, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.849747', 94),
(327, 'DC Charger 1', 'CHG-0095-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.03, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.859076', 95),
(328, 'DC Charger 2', 'CHG-0095-2', 'DC', 'CCS2', 50.00, 400, 150, 16.66, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.863152', 95),
(329, 'DC Charger 1', 'CHG-0096-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.58, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.871937', 96),
(330, 'DC Charger 2', 'CHG-0096-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.18, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.876351', 96),
(331, 'DC Charger 1', 'CHG-0097-1', 'DC', 'GB/T', 30.00, 400, 63, 10.82, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.885515', 97),
(332, 'DC Charger 2', 'CHG-0097-2', 'DC', 'CCS2', 60.00, 400, 150, 15.57, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.889892', 97),
(333, 'DC Charger 1', 'CHG-0098-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.99, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.903468', 98),
(334, 'AC Charger 2', 'CHG-0098-2', 'AC', 'Type2', 11.00, 230, 32, 10.05, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.908232', 98),
(335, 'DC Charger 1', 'CHG-0099-1', 'DC', 'CCS2', 50.00, 400, 150, 16.50, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.917198', 99),
(336, 'AC Charger 2', 'CHG-0099-2', 'AC', 'Type2', 22.00, 230, 32, 10.14, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.921990', 99),
(337, 'DC Charger 1', 'CHG-0100-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.46, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.931274', 100),
(338, 'DC Charger 2', 'CHG-0100-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.51, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.935737', 100),
(339, 'DC Charger 3', 'CHG-0100-3', 'DC', 'GB/T', 30.00, 400, 63, 12.03, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.940302', 100),
(340, 'DC Charger 4', 'CHG-0100-4', 'DC', 'GB/T', 30.00, 400, 63, 10.74, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.945078', 100),
(341, 'DC Charger 1', 'CHG-0101-1', 'DC', 'GB/T', 15.00, 400, 63, 13.05, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.953909', 101),
(342, 'DC Charger 2', 'CHG-0101-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.16, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.958399', 101),
(343, 'AC Charger 3', 'CHG-0101-3', 'AC', 'Type2', 22.00, 230, 32, 10.93, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.962487', 101),
(344, 'AC Charger 4', 'CHG-0101-4', 'AC', 'Type2', 11.00, 230, 32, 11.17, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.966782', 101),
(345, 'DC Charger 5', 'CHG-0101-5', 'DC', 'GB/T', 15.00, 400, 63, 12.46, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.971491', 101),
(346, 'AC Charger 1', 'CHG-0102-1', 'AC', 'Type2', 7.20, 230, 32, 9.50, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.980887', 102),
(347, 'DC Charger 2', 'CHG-0102-2', 'DC', 'CCS2', 150.00, 400, 150, 16.24, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.985705', 102),
(348, 'DC Charger 3', 'CHG-0102-3', 'DC', 'GB/T', 50.00, 400, 63, 12.50, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.990226', 102),
(349, 'DC Charger 4', 'CHG-0102-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.49, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:28.994447', 102),
(350, 'DC Charger 1', 'CHG-0103-1', 'DC', 'GB/T', 15.00, 400, 63, 12.19, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.003191', 103),
(351, 'AC Charger 2', 'CHG-0103-2', 'AC', 'Type2', 22.00, 230, 32, 8.91, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.008485', 103),
(352, 'DC Charger 3', 'CHG-0103-3', 'DC', 'GB/T', 15.00, 400, 63, 13.05, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.013572', 103),
(353, 'DC Charger 4', 'CHG-0103-4', 'DC', 'GB/T', 15.00, 400, 63, 11.74, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.018563', 103),
(354, 'DC Charger 1', 'CHG-0104-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.03, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.028450', 104);
INSERT INTO `charging_charger` (`id`, `charger_name`, `charger_number`, `charger_type`, `connector_type`, `power_output_kw`, `voltage`, `current`, `price_per_kwh`, `status`, `installation_date`, `last_maintenance`, `created_at`, `station_id`) VALUES
(355, 'DC Charger 2', 'CHG-0104-2', 'DC', 'GB/T', 50.00, 400, 63, 12.04, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.032762', 104),
(356, 'DC Charger 3', 'CHG-0104-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.27, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.037397', 104),
(357, 'AC Charger 1', 'CHG-0105-1', 'AC', 'Type2', 11.00, 230, 32, 9.71, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.047325', 105),
(358, 'AC Charger 2', 'CHG-0105-2', 'AC', 'Type2', 22.00, 230, 32, 10.98, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.051745', 105),
(359, 'AC Charger 3', 'CHG-0105-3', 'AC', 'Type2', 11.00, 230, 32, 8.63, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.056327', 105),
(360, 'DC Charger 4', 'CHG-0105-4', 'DC', 'GB/T', 50.00, 400, 63, 11.27, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.060716', 105),
(361, 'DC Charger 1', 'CHG-0106-1', 'DC', 'GB/T', 15.00, 400, 63, 11.74, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.070229', 106),
(362, 'DC Charger 2', 'CHG-0106-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.36, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.074975', 106),
(363, 'DC Charger 3', 'CHG-0106-3', 'DC', 'CCS2', 150.00, 400, 150, 16.05, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.079140', 106),
(364, 'DC Charger 4', 'CHG-0106-4', 'DC', 'GB/T', 15.00, 400, 63, 12.43, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.085682', 106),
(365, 'DC Charger 5', 'CHG-0106-5', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.95, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.090228', 106),
(366, 'DC Charger 1', 'CHG-0107-1', 'DC', 'GB/T', 50.00, 400, 63, 12.52, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.099049', 107),
(367, 'DC Charger 2', 'CHG-0107-2', 'DC', 'CCS2', 120.00, 400, 150, 17.43, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.103299', 107),
(368, 'AC Charger 3', 'CHG-0107-3', 'AC', 'Type2', 7.20, 230, 32, 11.49, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.107530', 107),
(369, 'DC Charger 4', 'CHG-0107-4', 'DC', 'GB/T', 15.00, 400, 63, 11.52, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.111959', 107),
(370, 'DC Charger 5', 'CHG-0107-5', 'DC', 'GB/T', 30.00, 400, 63, 11.20, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.116151', 107),
(371, 'AC Charger 1', 'CHG-0108-1', 'AC', 'Type2', 11.00, 230, 32, 9.34, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.125207', 108),
(372, 'DC Charger 2', 'CHG-0108-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.03, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.129489', 108),
(373, 'AC Charger 1', 'CHG-0109-1', 'AC', 'Type2', 7.20, 230, 32, 10.86, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.138528', 109),
(374, 'DC Charger 2', 'CHG-0109-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.65, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.142772', 109),
(375, 'DC Charger 3', 'CHG-0109-3', 'DC', 'CCS2', 60.00, 400, 150, 17.29, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.147005', 109),
(376, 'DC Charger 4', 'CHG-0109-4', 'DC', 'GB/T', 30.00, 400, 63, 13.49, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.151783', 109),
(377, 'DC Charger 5', 'CHG-0109-5', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.47, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.156197', 109),
(378, 'DC Charger 1', 'CHG-0110-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.41, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.165377', 110),
(379, 'DC Charger 2', 'CHG-0110-2', 'DC', 'GB/T', 15.00, 400, 63, 11.59, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.170404', 110),
(380, 'DC Charger 3', 'CHG-0110-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.23, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.174643', 110),
(381, 'DC Charger 1', 'CHG-0111-1', 'DC', 'GB/T', 15.00, 400, 63, 12.36, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.183433', 111),
(382, 'DC Charger 2', 'CHG-0111-2', 'DC', 'CCS2', 150.00, 400, 150, 17.09, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.187655', 111),
(383, 'DC Charger 3', 'CHG-0111-3', 'DC', 'GB/T', 50.00, 400, 63, 12.11, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.191997', 111),
(384, 'DC Charger 1', 'CHG-0112-1', 'DC', 'GB/T', 50.00, 400, 63, 11.11, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.200851', 112),
(385, 'DC Charger 2', 'CHG-0112-2', 'DC', 'CCS2', 50.00, 400, 150, 17.40, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.205326', 112),
(386, 'AC Charger 3', 'CHG-0112-3', 'AC', 'Type2', 22.00, 230, 32, 10.42, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.210518', 112),
(387, 'AC Charger 4', 'CHG-0112-4', 'AC', 'Type2', 7.20, 230, 32, 11.48, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.214964', 112),
(388, 'AC Charger 5', 'CHG-0112-5', 'AC', 'Type2', 22.00, 230, 32, 11.34, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.220142', 112),
(389, 'DC Charger 1', 'CHG-0113-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.42, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.229297', 113),
(390, 'AC Charger 2', 'CHG-0113-2', 'AC', 'Type2', 11.00, 230, 32, 10.70, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.234283', 113),
(391, 'AC Charger 3', 'CHG-0113-3', 'AC', 'Type2', 11.00, 230, 32, 9.93, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.238836', 113),
(392, 'DC Charger 4', 'CHG-0113-4', 'DC', 'CCS2', 60.00, 400, 150, 16.73, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.243168', 113),
(393, 'DC Charger 1', 'CHG-0114-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.64, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.252336', 114),
(394, 'AC Charger 2', 'CHG-0114-2', 'AC', 'Type2', 11.00, 230, 32, 10.26, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.256905', 114),
(395, 'DC Charger 1', 'CHG-0115-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.95, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.266027', 115),
(396, 'DC Charger 2', 'CHG-0115-2', 'DC', 'CCS2', 60.00, 400, 150, 15.95, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.270581', 115),
(397, 'DC Charger 3', 'CHG-0115-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.68, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.275417', 115),
(398, 'AC Charger 4', 'CHG-0115-4', 'AC', 'Type2', 22.00, 230, 32, 10.94, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.279903', 115),
(399, 'DC Charger 1', 'CHG-0116-1', 'DC', 'CCS2', 150.00, 400, 150, 17.13, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.289529', 116),
(400, 'AC Charger 2', 'CHG-0116-2', 'AC', 'Type2', 22.00, 230, 32, 10.14, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.293832', 116),
(401, 'DC Charger 3', 'CHG-0116-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.58, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.297991', 116),
(402, 'DC Charger 4', 'CHG-0116-4', 'DC', 'CCS2', 50.00, 400, 150, 15.77, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.303101', 116),
(403, 'DC Charger 1', 'CHG-0117-1', 'DC', 'GB/T', 15.00, 400, 63, 12.00, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.330423', 117),
(404, 'DC Charger 2', 'CHG-0117-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.68, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.335673', 117),
(405, 'DC Charger 3', 'CHG-0117-3', 'DC', 'GB/T', 50.00, 400, 63, 13.22, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.340434', 117),
(406, 'DC Charger 1', 'CHG-0118-1', 'DC', 'GB/T', 15.00, 400, 63, 11.15, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.349497', 118),
(407, 'DC Charger 2', 'CHG-0118-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.16, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.353982', 118),
(408, 'DC Charger 3', 'CHG-0118-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.58, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.358302', 118),
(409, 'DC Charger 4', 'CHG-0118-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.44, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.362505', 118),
(410, 'DC Charger 1', 'CHG-0119-1', 'DC', 'CCS2', 50.00, 400, 150, 15.10, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.371970', 119),
(411, 'DC Charger 2', 'CHG-0119-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.40, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.376303', 119),
(412, 'DC Charger 1', 'CHG-0120-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.10, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.385500', 120),
(413, 'AC Charger 2', 'CHG-0120-2', 'AC', 'Type2', 7.20, 230, 32, 10.45, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.389857', 120),
(414, 'DC Charger 3', 'CHG-0120-3', 'DC', 'CCS2', 120.00, 400, 150, 14.88, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.393878', 120),
(415, 'DC Charger 1', 'CHG-0121-1', 'DC', 'GB/T', 50.00, 400, 63, 12.38, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.402363', 121),
(416, 'DC Charger 2', 'CHG-0121-2', 'DC', 'GB/T', 30.00, 400, 63, 12.52, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.406880', 121),
(417, 'DC Charger 3', 'CHG-0121-3', 'DC', 'GB/T', 30.00, 400, 63, 12.36, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.411011', 121),
(418, 'DC Charger 4', 'CHG-0121-4', 'DC', 'CCS2', 120.00, 400, 150, 15.58, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.415248', 121),
(419, 'AC Charger 1', 'CHG-0122-1', 'AC', 'Type2', 7.20, 230, 32, 8.98, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.424702', 122),
(420, 'DC Charger 2', 'CHG-0122-2', 'DC', 'CCS2', 60.00, 400, 150, 16.75, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.428850', 122),
(421, 'DC Charger 1', 'CHG-0123-1', 'DC', 'CCS2', 120.00, 400, 150, 15.37, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.438045', 123),
(422, 'AC Charger 2', 'CHG-0123-2', 'AC', 'Type2', 7.20, 230, 32, 9.59, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.442754', 123),
(423, 'DC Charger 3', 'CHG-0123-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.58, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.446893', 123),
(424, 'DC Charger 4', 'CHG-0123-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.88, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.451033', 123),
(425, 'DC Charger 1', 'CHG-0124-1', 'DC', 'CCS2', 50.00, 400, 150, 15.98, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.460488', 124),
(426, 'AC Charger 2', 'CHG-0124-2', 'AC', 'Type2', 11.00, 230, 32, 11.31, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.464029', 124),
(427, 'DC Charger 3', 'CHG-0124-3', 'DC', 'CCS2', 120.00, 400, 150, 15.15, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.467761', 124),
(428, 'AC Charger 4', 'CHG-0124-4', 'AC', 'Type2', 7.20, 230, 32, 9.47, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.472284', 124),
(429, 'DC Charger 1', 'CHG-0125-1', 'DC', 'GB/T', 30.00, 400, 63, 12.11, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.480032', 125),
(430, 'AC Charger 2', 'CHG-0125-2', 'AC', 'Type2', 22.00, 230, 32, 8.99, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.484148', 125),
(431, 'DC Charger 3', 'CHG-0125-3', 'DC', 'GB/T', 50.00, 400, 63, 13.37, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.488628', 125),
(432, 'AC Charger 1', 'CHG-0126-1', 'AC', 'Type2', 22.00, 230, 32, 10.57, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.497896', 126),
(433, 'DC Charger 2', 'CHG-0126-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.18, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.502892', 126),
(434, 'DC Charger 3', 'CHG-0126-3', 'DC', 'GB/T', 15.00, 400, 63, 10.81, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.507618', 126),
(435, 'DC Charger 1', 'CHG-0127-1', 'DC', 'CCS2', 120.00, 400, 150, 15.78, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.516456', 127),
(436, 'DC Charger 2', 'CHG-0127-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.68, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.521617', 127),
(437, 'DC Charger 1', 'CHG-0128-1', 'DC', 'CCS2', 60.00, 400, 150, 15.58, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.531271', 128),
(438, 'AC Charger 2', 'CHG-0128-2', 'AC', 'Type2', 22.00, 230, 32, 9.38, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.536289', 128),
(439, 'DC Charger 3', 'CHG-0128-3', 'DC', 'GB/T', 50.00, 400, 63, 11.56, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.540800', 128),
(440, 'DC Charger 4', 'CHG-0128-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.11, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.544868', 128),
(441, 'DC Charger 5', 'CHG-0128-5', 'DC', 'GB/T', 50.00, 400, 63, 10.71, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.548917', 128),
(442, 'DC Charger 1', 'CHG-0129-1', 'DC', 'GB/T', 15.00, 400, 63, 12.17, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.558795', 129),
(443, 'DC Charger 2', 'CHG-0129-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.47, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.563049', 129),
(444, 'DC Charger 1', 'CHG-0130-1', 'DC', 'GB/T', 15.00, 400, 63, 11.85, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.572694', 130),
(445, 'DC Charger 2', 'CHG-0130-2', 'DC', 'GB/T', 50.00, 400, 63, 11.63, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.577132', 130),
(446, 'DC Charger 1', 'CHG-0131-1', 'DC', 'GB/T', 30.00, 400, 63, 11.72, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.586218', 131),
(447, 'AC Charger 2', 'CHG-0131-2', 'AC', 'Type2', 22.00, 230, 32, 9.46, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.590246', 131),
(448, 'DC Charger 3', 'CHG-0131-3', 'DC', 'GB/T', 15.00, 400, 63, 11.84, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.594237', 131),
(449, 'AC Charger 1', 'CHG-0132-1', 'AC', 'Type2', 11.00, 230, 32, 11.40, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.603509', 132),
(450, 'AC Charger 2', 'CHG-0132-2', 'AC', 'Type2', 7.20, 230, 32, 10.57, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.607799', 132),
(451, 'DC Charger 3', 'CHG-0132-3', 'DC', 'CCS2', 60.00, 400, 150, 16.05, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.611764', 132),
(452, 'DC Charger 4', 'CHG-0132-4', 'DC', 'GB/T', 50.00, 400, 63, 11.61, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.616022', 132),
(453, 'DC Charger 5', 'CHG-0132-5', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.52, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.620464', 132),
(454, 'DC Charger 1', 'CHG-0133-1', 'DC', 'GB/T', 50.00, 400, 63, 12.20, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.629679', 133),
(455, 'DC Charger 2', 'CHG-0133-2', 'DC', 'CCS2', 50.00, 400, 150, 14.52, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.634054', 133),
(456, 'DC Charger 3', 'CHG-0133-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.02, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.638822', 133),
(457, 'DC Charger 4', 'CHG-0133-4', 'DC', 'GB/T', 30.00, 400, 63, 11.92, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.643120', 133),
(458, 'DC Charger 1', 'CHG-0134-1', 'DC', 'CCS2', 150.00, 400, 150, 17.12, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.650734', 134),
(459, 'AC Charger 2', 'CHG-0134-2', 'AC', 'Type2', 22.00, 230, 32, 10.52, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.654874', 134),
(460, 'DC Charger 3', 'CHG-0134-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.57, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.658529', 134),
(461, 'DC Charger 4', 'CHG-0134-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.45, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.661722', 134),
(462, 'DC Charger 1', 'CHG-0135-1', 'DC', 'CCS2', 120.00, 400, 150, 15.91, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.669744', 135),
(463, 'DC Charger 2', 'CHG-0135-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.87, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.673968', 135),
(464, 'DC Charger 3', 'CHG-0135-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.89, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.678326', 135),
(465, 'DC Charger 4', 'CHG-0135-4', 'DC', 'CCS2', 120.00, 400, 150, 14.66, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.682848', 135),
(466, 'DC Charger 5', 'CHG-0135-5', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.60, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.687893', 135),
(467, 'AC Charger 1', 'CHG-0136-1', 'AC', 'Type2', 7.20, 230, 32, 9.60, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.697619', 136),
(468, 'DC Charger 2', 'CHG-0136-2', 'DC', 'GB/T', 15.00, 400, 63, 10.89, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.702455', 136),
(469, 'DC Charger 3', 'CHG-0136-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.91, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.707562', 136),
(470, 'DC Charger 4', 'CHG-0136-4', 'DC', 'GB/T', 50.00, 400, 63, 11.71, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.714870', 136),
(471, 'DC Charger 1', 'CHG-0137-1', 'DC', 'GB/T', 30.00, 400, 63, 13.37, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.725511', 137),
(472, 'DC Charger 2', 'CHG-0137-2', 'DC', 'GB/T', 50.00, 400, 63, 10.91, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.730288', 137),
(473, 'AC Charger 1', 'CHG-0138-1', 'AC', 'Type2', 7.20, 230, 32, 11.40, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.740537', 138),
(474, 'AC Charger 2', 'CHG-0138-2', 'AC', 'Type2', 22.00, 230, 32, 9.19, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.745223', 138),
(475, 'DC Charger 3', 'CHG-0138-3', 'DC', 'GB/T', 15.00, 400, 63, 12.39, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.749540', 138),
(476, 'DC Charger 4', 'CHG-0138-4', 'DC', 'CCS2', 150.00, 400, 150, 17.08, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.754399', 138),
(477, 'DC Charger 5', 'CHG-0138-5', 'DC', 'GB/T', 50.00, 400, 63, 10.77, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.759164', 138),
(478, 'DC Charger 1', 'CHG-0139-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.72, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.769306', 139),
(479, 'DC Charger 2', 'CHG-0139-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.39, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.774389', 139),
(480, 'DC Charger 3', 'CHG-0139-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.51, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.778846', 139),
(481, 'DC Charger 4', 'CHG-0139-4', 'DC', 'CCS2', 120.00, 400, 150, 16.82, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.783285', 139),
(482, 'AC Charger 1', 'CHG-0140-1', 'AC', 'Type2', 7.20, 230, 32, 9.80, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.794001', 140),
(483, 'DC Charger 2', 'CHG-0140-2', 'DC', 'GB/T', 15.00, 400, 63, 10.85, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.798706', 140),
(484, 'DC Charger 3', 'CHG-0140-3', 'DC', 'GB/T', 50.00, 400, 63, 12.44, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.803916', 140),
(485, 'DC Charger 1', 'CHG-0141-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.78, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.814463', 141),
(486, 'DC Charger 2', 'CHG-0141-2', 'DC', 'GB/T', 30.00, 400, 63, 13.32, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.819655', 141),
(487, 'DC Charger 3', 'CHG-0141-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.80, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.824666', 141),
(488, 'DC Charger 4', 'CHG-0141-4', 'DC', 'GB/T', 30.00, 400, 63, 12.73, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.829227', 141),
(489, 'DC Charger 5', 'CHG-0141-5', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.09, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.833875', 141),
(490, 'DC Charger 1', 'CHG-0142-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.11, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.843535', 142),
(491, 'DC Charger 2', 'CHG-0142-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.23, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.848005', 142),
(492, 'DC Charger 3', 'CHG-0142-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.58, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.852502', 142),
(493, 'AC Charger 1', 'CHG-0143-1', 'AC', 'Type2', 7.20, 230, 32, 10.62, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.862616', 143),
(494, 'DC Charger 2', 'CHG-0143-2', 'DC', 'GB/T', 30.00, 400, 63, 11.03, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.866720', 143),
(495, 'DC Charger 3', 'CHG-0143-3', 'DC', 'GB/T', 50.00, 400, 63, 13.04, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.871270', 143),
(496, 'DC Charger 4', 'CHG-0143-4', 'DC', 'GB/T', 50.00, 400, 63, 11.51, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.875929', 143),
(497, 'DC Charger 1', 'CHG-0144-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.36, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.885071', 144),
(498, 'AC Charger 2', 'CHG-0144-2', 'AC', 'Type2', 11.00, 230, 32, 10.47, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.889984', 144),
(499, 'DC Charger 3', 'CHG-0144-3', 'DC', 'GB/T', 30.00, 400, 63, 11.81, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.895103', 144),
(500, 'AC Charger 1', 'CHG-0145-1', 'AC', 'Type2', 7.20, 230, 32, 8.77, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.905095', 145),
(501, 'DC Charger 2', 'CHG-0145-2', 'DC', 'GB/T', 30.00, 400, 63, 11.71, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.909901', 145),
(502, 'AC Charger 3', 'CHG-0145-3', 'AC', 'Type2', 7.20, 230, 32, 10.99, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.914351', 145),
(503, 'DC Charger 4', 'CHG-0145-4', 'DC', 'GB/T', 15.00, 400, 63, 12.25, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.920329', 145),
(504, 'DC Charger 5', 'CHG-0145-5', 'DC', 'GB/T', 15.00, 400, 63, 12.66, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.924623', 145),
(505, 'AC Charger 1', 'CHG-0146-1', 'AC', 'Type2', 11.00, 230, 32, 9.65, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.933762', 146),
(506, 'DC Charger 2', 'CHG-0146-2', 'DC', 'CCS2', 50.00, 400, 150, 14.90, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.938826', 146),
(507, 'DC Charger 1', 'CHG-0147-1', 'DC', 'CCS2', 150.00, 400, 150, 15.56, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.947410', 147),
(508, 'AC Charger 2', 'CHG-0147-2', 'AC', 'Type2', 11.00, 230, 32, 9.59, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.951513', 147),
(509, 'AC Charger 1', 'CHG-0148-1', 'AC', 'Type2', 7.20, 230, 32, 10.82, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.964222', 148),
(510, 'DC Charger 2', 'CHG-0148-2', 'DC', 'GB/T', 30.00, 400, 63, 10.77, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.968621', 148),
(511, 'DC Charger 3', 'CHG-0148-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.86, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.973127', 148),
(512, 'DC Charger 4', 'CHG-0148-4', 'DC', 'CCS2', 50.00, 400, 150, 15.39, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.977190', 148),
(513, 'DC Charger 5', 'CHG-0148-5', 'DC', 'CCS2', 150.00, 400, 150, 17.12, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.981407', 148),
(514, 'DC Charger 1', 'CHG-0149-1', 'DC', 'CCS2', 60.00, 400, 150, 16.33, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.990146', 149),
(515, 'DC Charger 2', 'CHG-0149-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.95, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:29.994751', 149),
(516, 'DC Charger 1', 'CHG-0150-1', 'DC', 'CCS2', 60.00, 400, 150, 16.55, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.003305', 150),
(517, 'DC Charger 2', 'CHG-0150-2', 'DC', 'GB/T', 30.00, 400, 63, 12.22, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.007665', 150),
(518, 'DC Charger 3', 'CHG-0150-3', 'DC', 'CCS2', 60.00, 400, 150, 15.29, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.012294', 150),
(519, 'AC Charger 1', 'CHG-0151-1', 'AC', 'Type2', 7.20, 230, 32, 10.53, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.021657', 151),
(520, 'DC Charger 2', 'CHG-0151-2', 'DC', 'CCS2', 50.00, 400, 150, 16.20, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.025748', 151),
(521, 'DC Charger 3', 'CHG-0151-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.07, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.029644', 151),
(522, 'DC Charger 4', 'CHG-0151-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.19, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.033578', 151),
(523, 'AC Charger 5', 'CHG-0151-5', 'AC', 'Type2', 22.00, 230, 32, 9.85, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.037070', 151),
(524, 'DC Charger 1', 'CHG-0152-1', 'DC', 'CCS2', 150.00, 400, 150, 16.67, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.045515', 152),
(525, 'DC Charger 2', 'CHG-0152-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.92, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.049118', 152),
(526, 'DC Charger 1', 'CHG-0153-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.27, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.057821', 153),
(527, 'DC Charger 2', 'CHG-0153-2', 'DC', 'CCS2', 50.00, 400, 150, 16.73, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.061986', 153),
(528, 'DC Charger 3', 'CHG-0153-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.83, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.065711', 153),
(529, 'DC Charger 1', 'CHG-0154-1', 'DC', 'GB/T', 50.00, 400, 63, 11.20, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.074603', 154),
(530, 'DC Charger 2', 'CHG-0154-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.85, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.078406', 154),
(531, 'DC Charger 3', 'CHG-0154-3', 'DC', 'GB/T', 30.00, 400, 63, 12.86, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.082484', 154),
(532, 'DC Charger 1', 'CHG-0155-1', 'DC', 'GB/T', 30.00, 400, 63, 13.29, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.091427', 155),
(533, 'DC Charger 2', 'CHG-0155-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.12, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.095835', 155),
(534, 'DC Charger 3', 'CHG-0155-3', 'DC', 'GB/T', 15.00, 400, 63, 13.12, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.099878', 155),
(535, 'DC Charger 1', 'CHG-0156-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.77, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.109039', 156),
(536, 'AC Charger 2', 'CHG-0156-2', 'AC', 'Type2', 7.20, 230, 32, 9.37, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.113052', 156),
(537, 'DC Charger 3', 'CHG-0156-3', 'DC', 'CCS2', 60.00, 400, 150, 14.70, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.116750', 156),
(538, 'DC Charger 4', 'CHG-0156-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.90, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.121153', 156),
(539, 'DC Charger 5', 'CHG-0156-5', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.52, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.125295', 156),
(540, 'DC Charger 1', 'CHG-0157-1', 'DC', 'GB/T', 30.00, 400, 63, 11.80, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.133563', 157),
(541, 'DC Charger 2', 'CHG-0157-2', 'DC', 'CCS2', 120.00, 400, 150, 14.69, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.137608', 157),
(542, 'DC Charger 3', 'CHG-0157-3', 'DC', 'GB/T', 30.00, 400, 63, 10.56, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.141491', 157),
(543, 'DC Charger 4', 'CHG-0157-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.41, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.145273', 157),
(544, 'AC Charger 1', 'CHG-0158-1', 'AC', 'Type2', 11.00, 230, 32, 9.37, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.153699', 158),
(545, 'AC Charger 2', 'CHG-0158-2', 'AC', 'Type2', 11.00, 230, 32, 8.56, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.157685', 158),
(546, 'DC Charger 3', 'CHG-0158-3', 'DC', 'CCS2', 50.00, 400, 150, 15.18, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.161769', 158),
(547, 'DC Charger 1', 'CHG-0159-1', 'DC', 'CCS2', 50.00, 400, 150, 16.91, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.170631', 159),
(548, 'DC Charger 2', 'CHG-0159-2', 'DC', 'CCS2', 150.00, 400, 150, 16.96, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.174798', 159),
(549, 'DC Charger 3', 'CHG-0159-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.79, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.178757', 159),
(550, 'DC Charger 1', 'CHG-0160-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.14, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.187093', 160),
(551, 'DC Charger 2', 'CHG-0160-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.92, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.191086', 160),
(552, 'DC Charger 3', 'CHG-0160-3', 'DC', 'CCS2', 120.00, 400, 150, 15.98, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.195292', 160),
(553, 'DC Charger 4', 'CHG-0160-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.62, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.199317', 160),
(554, 'DC Charger 1', 'CHG-0161-1', 'DC', 'CCS2', 50.00, 400, 150, 16.35, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.207668', 161),
(555, 'AC Charger 2', 'CHG-0161-2', 'AC', 'Type2', 22.00, 230, 32, 9.03, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.211401', 161),
(556, 'DC Charger 3', 'CHG-0161-3', 'DC', 'GB/T', 15.00, 400, 63, 12.85, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.215353', 161),
(557, 'DC Charger 4', 'CHG-0161-4', 'DC', 'CCS2', 150.00, 400, 150, 15.68, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.220020', 161),
(558, 'DC Charger 1', 'CHG-0162-1', 'DC', 'CCS2', 60.00, 400, 150, 14.74, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.228229', 162),
(559, 'DC Charger 2', 'CHG-0162-2', 'DC', 'GB/T', 30.00, 400, 63, 12.17, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.232478', 162),
(560, 'DC Charger 3', 'CHG-0162-3', 'DC', 'CCS2', 60.00, 400, 150, 17.23, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.236052', 162),
(561, 'DC Charger 4', 'CHG-0162-4', 'DC', 'CCS2', 120.00, 400, 150, 15.04, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.240024', 162),
(562, 'AC Charger 1', 'CHG-0163-1', 'AC', 'Type2', 22.00, 230, 32, 10.24, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.248128', 163),
(563, 'AC Charger 2', 'CHG-0163-2', 'AC', 'Type2', 22.00, 230, 32, 9.70, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.252186', 163),
(564, 'DC Charger 3', 'CHG-0163-3', 'DC', 'GB/T', 50.00, 400, 63, 13.10, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.256402', 163),
(565, 'DC Charger 4', 'CHG-0163-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.05, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.260389', 163),
(566, 'DC Charger 5', 'CHG-0163-5', 'DC', 'CCS2', 150.00, 400, 150, 17.10, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.266046', 163),
(567, 'DC Charger 1', 'CHG-0164-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.06, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.275669', 164),
(568, 'DC Charger 2', 'CHG-0164-2', 'DC', 'GB/T', 50.00, 400, 63, 13.49, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.279829', 164),
(569, 'AC Charger 3', 'CHG-0164-3', 'AC', 'Type2', 22.00, 230, 32, 9.40, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.283888', 164),
(570, 'DC Charger 1', 'CHG-0165-1', 'DC', 'CCS2', 50.00, 400, 150, 14.91, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.292646', 165),
(571, 'DC Charger 2', 'CHG-0165-2', 'DC', 'CCS2', 150.00, 400, 150, 16.73, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.296315', 165),
(572, 'DC Charger 3', 'CHG-0165-3', 'DC', 'CCS2', 150.00, 400, 150, 16.13, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.300139', 165),
(573, 'DC Charger 1', 'CHG-0166-1', 'DC', 'CCS2', 150.00, 400, 150, 15.51, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.309112', 166),
(574, 'DC Charger 2', 'CHG-0166-2', 'DC', 'GB/T', 30.00, 400, 63, 11.68, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.314289', 166),
(575, 'DC Charger 3', 'CHG-0166-3', 'DC', 'CCS2', 150.00, 400, 150, 15.66, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.318458', 166),
(576, 'AC Charger 1', 'CHG-0167-1', 'AC', 'Type2', 7.20, 230, 32, 10.36, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.334287', 167),
(577, 'DC Charger 2', 'CHG-0167-2', 'DC', 'CCS2', 120.00, 400, 150, 16.10, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.341086', 167),
(578, 'DC Charger 1', 'CHG-0168-1', 'DC', 'CCS2', 60.00, 400, 150, 15.78, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.352139', 168),
(579, 'DC Charger 2', 'CHG-0168-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.65, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.357707', 168),
(580, 'AC Charger 3', 'CHG-0168-3', 'AC', 'Type2', 22.00, 230, 32, 9.58, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.361865', 168),
(581, 'AC Charger 1', 'CHG-0169-1', 'AC', 'Type2', 7.20, 230, 32, 9.35, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.370016', 169),
(582, 'DC Charger 2', 'CHG-0169-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.74, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.373693', 169),
(583, 'AC Charger 3', 'CHG-0169-3', 'AC', 'Type2', 11.00, 230, 32, 8.90, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.377393', 169),
(584, 'DC Charger 4', 'CHG-0169-4', 'DC', 'CCS2', 150.00, 400, 150, 15.63, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.381219', 169),
(585, 'DC Charger 5', 'CHG-0169-5', 'DC', 'CCS2', 120.00, 400, 150, 15.19, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.385378', 169),
(586, 'AC Charger 1', 'CHG-0170-1', 'AC', 'Type2', 11.00, 230, 32, 9.25, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.395349', 170),
(587, 'DC Charger 2', 'CHG-0170-2', 'DC', 'CCS2', 150.00, 400, 150, 15.59, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.399703', 170),
(588, 'DC Charger 3', 'CHG-0170-3', 'DC', 'CCS2', 150.00, 400, 150, 17.30, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.404699', 170),
(589, 'AC Charger 1', 'CHG-0171-1', 'AC', 'Type2', 11.00, 230, 32, 10.72, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.414098', 171),
(590, 'DC Charger 2', 'CHG-0171-2', 'DC', 'CCS2', 50.00, 400, 150, 16.69, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.418865', 171),
(591, 'DC Charger 3', 'CHG-0171-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.44, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.423621', 171),
(592, 'DC Charger 1', 'CHG-0172-1', 'DC', 'CCS2', 50.00, 400, 150, 16.34, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.433262', 172),
(593, 'DC Charger 2', 'CHG-0172-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.72, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.438131', 172),
(594, 'DC Charger 3', 'CHG-0172-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.44, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.442601', 172),
(595, 'DC Charger 1', 'CHG-0173-1', 'DC', 'CCS2', 50.00, 400, 150, 17.16, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.452380', 173),
(596, 'DC Charger 2', 'CHG-0173-2', 'DC', 'CCS2', 150.00, 400, 150, 16.33, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.456900', 173),
(597, 'DC Charger 3', 'CHG-0173-3', 'DC', 'GB/T', 15.00, 400, 63, 12.15, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.461234', 173),
(598, 'DC Charger 1', 'CHG-0174-1', 'DC', 'CCS2', 50.00, 400, 150, 16.43, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.471038', 174),
(599, 'DC Charger 2', 'CHG-0174-2', 'DC', 'GB/T', 30.00, 400, 63, 13.34, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.475395', 174),
(600, 'DC Charger 3', 'CHG-0174-3', 'DC', 'CCS2', 120.00, 400, 150, 16.74, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.479791', 174),
(601, 'DC Charger 4', 'CHG-0174-4', 'DC', 'CCS2', 50.00, 400, 150, 15.86, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.484114', 174),
(602, 'DC Charger 1', 'CHG-0175-1', 'DC', 'GB/T', 30.00, 400, 63, 11.47, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.493751', 175),
(603, 'AC Charger 2', 'CHG-0175-2', 'AC', 'Type2', 7.20, 230, 32, 9.70, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.498291', 175),
(604, 'DC Charger 3', 'CHG-0175-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.43, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.508367', 175),
(605, 'DC Charger 4', 'CHG-0175-4', 'DC', 'GB/T', 30.00, 400, 63, 12.25, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.512860', 175),
(606, 'AC Charger 1', 'CHG-0176-1', 'AC', 'Type2', 22.00, 230, 32, 8.73, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.522568', 176),
(607, 'DC Charger 2', 'CHG-0176-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.05, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.527473', 176),
(608, 'DC Charger 3', 'CHG-0176-3', 'DC', 'GB/T', 15.00, 400, 63, 10.55, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.531729', 176),
(609, 'DC Charger 4', 'CHG-0176-4', 'DC', 'CCS2', 60.00, 400, 150, 15.67, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.536150', 176),
(610, 'DC Charger 1', 'CHG-0177-1', 'DC', 'GB/T', 15.00, 400, 63, 12.94, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.544836', 177),
(611, 'DC Charger 2', 'CHG-0177-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.94, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.549153', 177),
(612, 'DC Charger 1', 'CHG-0178-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.19, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.558842', 178),
(613, 'DC Charger 2', 'CHG-0178-2', 'DC', 'GB/T', 15.00, 400, 63, 10.80, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.563111', 178),
(614, 'AC Charger 1', 'CHG-0179-1', 'AC', 'Type2', 22.00, 230, 32, 11.13, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.572276', 179),
(615, 'DC Charger 2', 'CHG-0179-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.20, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.576633', 179),
(616, 'DC Charger 3', 'CHG-0179-3', 'DC', 'GB/T', 50.00, 400, 63, 10.99, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.580743', 179),
(617, 'DC Charger 4', 'CHG-0179-4', 'DC', 'CCS2', 150.00, 400, 150, 15.97, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.585118', 179),
(618, 'AC Charger 5', 'CHG-0179-5', 'AC', 'Type2', 11.00, 230, 32, 9.12, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.590179', 179),
(619, 'DC Charger 1', 'CHG-0180-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.82, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.599519', 180),
(620, 'DC Charger 2', 'CHG-0180-2', 'DC', 'GB/T', 50.00, 400, 63, 12.28, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.604091', 180),
(621, 'DC Charger 3', 'CHG-0180-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.04, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.608715', 180),
(622, 'AC Charger 1', 'CHG-0181-1', 'AC', 'Type2', 22.00, 230, 32, 9.81, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.618868', 181),
(623, 'DC Charger 2', 'CHG-0181-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.50, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.623801', 181),
(624, 'DC Charger 1', 'CHG-0182-1', 'DC', 'CCS2', 150.00, 400, 150, 17.00, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.633090', 182),
(625, 'DC Charger 2', 'CHG-0182-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.80, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.638583', 182),
(626, 'DC Charger 3', 'CHG-0182-3', 'DC', 'CCS2', 60.00, 400, 150, 17.00, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.643631', 182),
(627, 'DC Charger 1', 'CHG-0183-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.43, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.654013', 183),
(628, 'DC Charger 2', 'CHG-0183-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.91, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.658963', 183),
(629, 'AC Charger 3', 'CHG-0183-3', 'AC', 'Type2', 22.00, 230, 32, 10.88, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.663583', 183),
(630, 'DC Charger 4', 'CHG-0183-4', 'DC', 'CCS2', 120.00, 400, 150, 14.84, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.668470', 183),
(631, 'AC Charger 5', 'CHG-0183-5', 'AC', 'Type2', 11.00, 230, 32, 9.48, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.672966', 183),
(632, 'DC Charger 1', 'CHG-0184-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.30, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.682103', 184),
(633, 'DC Charger 2', 'CHG-0184-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.74, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.686922', 184),
(634, 'DC Charger 3', 'CHG-0184-3', 'DC', 'CCS2', 60.00, 400, 150, 15.15, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.691579', 184),
(635, 'DC Charger 1', 'CHG-0185-1', 'DC', 'GB/T', 15.00, 400, 63, 12.54, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.701372', 185),
(636, 'AC Charger 2', 'CHG-0185-2', 'AC', 'Type2', 11.00, 230, 32, 10.37, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.706154', 185),
(637, 'AC Charger 3', 'CHG-0185-3', 'AC', 'Type2', 11.00, 230, 32, 9.32, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.710583', 185),
(638, 'DC Charger 4', 'CHG-0185-4', 'DC', 'GB/T', 50.00, 400, 63, 11.84, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.714598', 185),
(639, 'AC Charger 5', 'CHG-0185-5', 'AC', 'Type2', 11.00, 230, 32, 11.43, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.719640', 185),
(640, 'DC Charger 1', 'CHG-0186-1', 'DC', 'GB/T', 50.00, 400, 63, 10.51, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.728066', 186),
(641, 'DC Charger 2', 'CHG-0186-2', 'DC', 'GB/T', 50.00, 400, 63, 11.27, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.731443', 186),
(642, 'DC Charger 1', 'CHG-0187-1', 'DC', 'CCS2', 150.00, 400, 150, 16.48, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.739876', 187),
(643, 'DC Charger 2', 'CHG-0187-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.30, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.743515', 187),
(644, 'AC Charger 3', 'CHG-0187-3', 'AC', 'Type2', 22.00, 230, 32, 10.95, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.746778', 187),
(645, 'DC Charger 4', 'CHG-0187-4', 'DC', 'GB/T', 50.00, 400, 63, 11.76, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.750310', 187),
(646, 'DC Charger 5', 'CHG-0187-5', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.66, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.754170', 187),
(647, 'DC Charger 1', 'CHG-0188-1', 'DC', 'CCS2', 150.00, 400, 150, 16.67, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.762696', 188),
(648, 'DC Charger 2', 'CHG-0188-2', 'DC', 'CCS2', 50.00, 400, 150, 16.19, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.766337', 188),
(649, 'DC Charger 3', 'CHG-0188-3', 'DC', 'GB/T', 15.00, 400, 63, 11.72, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.770698', 188),
(650, 'AC Charger 4', 'CHG-0188-4', 'AC', 'Type2', 22.00, 230, 32, 9.22, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.775446', 188),
(651, 'DC Charger 1', 'CHG-0189-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.64, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.785937', 189),
(652, 'DC Charger 2', 'CHG-0189-2', 'DC', 'GB/T', 50.00, 400, 63, 11.45, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.790302', 189),
(653, 'DC Charger 1', 'CHG-0190-1', 'DC', 'CCS2', 50.00, 400, 150, 16.99, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.799604', 190),
(654, 'DC Charger 2', 'CHG-0190-2', 'DC', 'CCS2', 60.00, 400, 150, 14.84, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.805398', 190),
(655, 'DC Charger 1', 'CHG-0191-1', 'DC', 'CCS2', 120.00, 400, 150, 17.17, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.814671', 191),
(656, 'AC Charger 2', 'CHG-0191-2', 'AC', 'Type2', 7.20, 230, 32, 11.10, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.819187', 191),
(657, 'DC Charger 3', 'CHG-0191-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.55, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.823750', 191),
(658, 'DC Charger 4', 'CHG-0191-4', 'DC', 'GB/T', 50.00, 400, 63, 11.64, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.827985', 191),
(659, 'DC Charger 5', 'CHG-0191-5', 'DC', 'CCS2', 60.00, 400, 150, 16.07, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.832113', 191),
(660, 'DC Charger 1', 'CHG-0192-1', 'DC', 'CCS2', 120.00, 400, 150, 16.71, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.842438', 192),
(661, 'DC Charger 2', 'CHG-0192-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.34, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.847532', 192),
(662, 'AC Charger 3', 'CHG-0192-3', 'AC', 'Type2', 11.00, 230, 32, 10.00, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.853735', 192),
(663, 'AC Charger 4', 'CHG-0192-4', 'AC', 'Type2', 22.00, 230, 32, 11.50, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.858314', 192),
(664, 'AC Charger 5', 'CHG-0192-5', 'AC', 'Type2', 22.00, 230, 32, 11.00, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.862702', 192),
(665, 'DC Charger 1', 'CHG-0193-1', 'DC', 'GB/T', 50.00, 400, 63, 12.25, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.875568', 193),
(666, 'AC Charger 2', 'CHG-0193-2', 'AC', 'Type2', 11.00, 230, 32, 10.95, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.880282', 193),
(667, 'AC Charger 3', 'CHG-0193-3', 'AC', 'Type2', 11.00, 230, 32, 10.24, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.885031', 193),
(668, 'AC Charger 4', 'CHG-0193-4', 'AC', 'Type2', 7.20, 230, 32, 8.58, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.890019', 193),
(669, 'DC Charger 5', 'CHG-0193-5', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.39, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.894384', 193),
(670, 'AC Charger 1', 'CHG-0194-1', 'AC', 'Type2', 22.00, 230, 32, 10.63, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.904047', 194),
(671, 'DC Charger 2', 'CHG-0194-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.45, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.908588', 194),
(672, 'DC Charger 3', 'CHG-0194-3', 'DC', 'CCS2', 50.00, 400, 150, 17.33, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.912851', 194),
(673, 'AC Charger 1', 'CHG-0195-1', 'AC', 'Type2', 11.00, 230, 32, 9.94, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.921768', 195),
(674, 'DC Charger 2', 'CHG-0195-2', 'DC', 'CCS2', 60.00, 400, 150, 14.81, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.926012', 195),
(675, 'DC Charger 3', 'CHG-0195-3', 'DC', 'CCS2', 60.00, 400, 150, 16.16, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.930387', 195),
(676, 'DC Charger 1', 'CHG-0196-1', 'DC', 'GB/T', 15.00, 400, 63, 13.27, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.939530', 196),
(677, 'DC Charger 2', 'CHG-0196-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.15, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.943891', 196),
(678, 'DC Charger 3', 'CHG-0196-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.24, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.948307', 196),
(679, 'DC Charger 4', 'CHG-0196-4', 'DC', 'CCS2', 120.00, 400, 150, 16.37, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.952878', 196),
(680, 'AC Charger 1', 'CHG-0197-1', 'AC', 'Type2', 22.00, 230, 32, 8.99, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.961876', 197),
(681, 'DC Charger 2', 'CHG-0197-2', 'DC', 'GB/T', 30.00, 400, 63, 13.19, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.965989', 197),
(682, 'AC Charger 1', 'CHG-0198-1', 'AC', 'Type2', 7.20, 230, 32, 11.39, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.975716', 198),
(683, 'AC Charger 2', 'CHG-0198-2', 'AC', 'Type2', 7.20, 230, 32, 11.37, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.980000', 198),
(684, 'DC Charger 3', 'CHG-0198-3', 'DC', 'CCS2', 120.00, 400, 150, 15.91, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.984252', 198),
(685, 'DC Charger 4', 'CHG-0198-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.18, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.988531', 198),
(686, 'DC Charger 1', 'CHG-0199-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.08, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:30.997568', 199),
(687, 'DC Charger 2', 'CHG-0199-2', 'DC', 'CCS2', 60.00, 400, 150, 16.83, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.002345', 199),
(688, 'DC Charger 3', 'CHG-0199-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.17, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.006937', 199),
(689, 'DC Charger 4', 'CHG-0199-4', 'DC', 'GB/T', 30.00, 400, 63, 10.94, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.011519', 199),
(690, 'AC Charger 5', 'CHG-0199-5', 'AC', 'Type2', 7.20, 230, 32, 10.83, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.016297', 199),
(691, 'AC Charger 1', 'CHG-0200-1', 'AC', 'Type2', 22.00, 230, 32, 8.81, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.026269', 200),
(692, 'DC Charger 2', 'CHG-0200-2', 'DC', 'CCS2', 50.00, 400, 150, 15.15, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.030862', 200),
(693, 'AC Charger 3', 'CHG-0200-3', 'AC', 'Type2', 7.20, 230, 32, 10.24, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.034845', 200),
(694, 'DC Charger 4', 'CHG-0200-4', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.43, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.039163', 200),
(695, 'DC Charger 5', 'CHG-0200-5', 'DC', 'CCS2', 120.00, 400, 150, 15.62, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.043411', 200),
(696, 'DC Charger 1', 'CHG-0201-1', 'DC', 'CCS2', 60.00, 400, 150, 16.32, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.052721', 201),
(697, 'DC Charger 2', 'CHG-0201-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.66, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.057011', 201),
(698, 'DC Charger 1', 'CHG-0202-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.22, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.065971', 202),
(699, 'AC Charger 2', 'CHG-0202-2', 'AC', 'Type2', 7.20, 230, 32, 8.69, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.070804', 202),
(700, 'AC Charger 1', 'CHG-0203-1', 'AC', 'Type2', 7.20, 230, 32, 10.71, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.080439', 203),
(701, 'DC Charger 2', 'CHG-0203-2', 'DC', 'CCS2', 60.00, 400, 150, 17.18, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.085611', 203),
(702, 'DC Charger 1', 'CHG-0204-1', 'DC', 'CHAdeMO', 50.00, 400, 125, 15.42, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.096248', 204),
(703, 'DC Charger 2', 'CHG-0204-2', 'DC', 'CHAdeMO', 50.00, 400, 125, 13.96, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.100682', 204),
(704, 'DC Charger 3', 'CHG-0204-3', 'DC', 'CHAdeMO', 50.00, 400, 125, 14.84, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.105561', 204),
(705, 'DC Charger 4', 'CHG-0204-4', 'DC', 'CCS2', 150.00, 400, 150, 15.73, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.110291', 204);
INSERT INTO `charging_charger` (`id`, `charger_name`, `charger_number`, `charger_type`, `connector_type`, `power_output_kw`, `voltage`, `current`, `price_per_kwh`, `status`, `installation_date`, `last_maintenance`, `created_at`, `station_id`) VALUES
(706, 'DC Charger 5', 'CHG-0204-5', 'DC', 'CCS2', 50.00, 400, 150, 17.07, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.114786', 204),
(707, 'DC Charger 1', 'CHG-0205-1', 'DC', 'CCS2', 150.00, 400, 150, 16.68, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.124855', 205),
(708, 'AC Charger 2', 'CHG-0205-2', 'AC', 'Type2', 22.00, 230, 32, 10.94, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.129482', 205),
(709, 'AC Charger 3', 'CHG-0205-3', 'AC', 'Type2', 7.20, 230, 32, 10.64, 'AVAILABLE', '2026-07-28', NULL, '2026-07-28 10:08:31.133776', 205);

-- --------------------------------------------------------

--
-- Table structure for table `charging_chargingsession`
--

CREATE TABLE `charging_chargingsession` (
  `id` bigint(20) NOT NULL,
  `start_time` datetime(6) NOT NULL,
  `end_time` datetime(6) DEFAULT NULL,
  `battery_before` decimal(5,2) NOT NULL,
  `battery_after` decimal(5,2) DEFAULT NULL,
  `energy_consumed_kwh` decimal(8,2) NOT NULL,
  `charging_cost` decimal(10,2) NOT NULL,
  `session_status` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `booking_id` bigint(20) NOT NULL,
  `charger_id` bigint(20) NOT NULL,
  `vehicle_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `charging_chargingsession`
--

INSERT INTO `charging_chargingsession` (`id`, `start_time`, `end_time`, `battery_before`, `battery_after`, `energy_consumed_kwh`, `charging_cost`, `session_status`, `created_at`, `booking_id`, `charger_id`, `vehicle_id`) VALUES
(1, '2026-07-07 18:14:29.000000', '2026-07-09 17:10:37.838130', 54.00, 85.00, 18.60, 241.80, 'COMPLETED', '2026-07-07 18:15:19.720046', 1, 1, 1),
(2, '2026-07-07 18:47:44.000000', '2026-07-09 18:24:35.088854', 20.00, 80.00, 56.00, 569.00, 'COMPLETED', '2026-07-07 18:48:23.207205', 1, 1, 1),
(3, '2026-07-07 18:50:11.000000', '2026-07-07 19:13:39.635983', 20.00, 90.00, 42.00, 546.00, 'COMPLETED', '2026-07-07 18:50:34.181211', 1, 1, 1),
(4, '2026-07-09 17:47:00.340982', '2026-07-10 07:44:30.772000', 89.00, 91.40, 1.44, 18.72, 'COMPLETED', '2026-07-09 17:47:00.341528', 8, 1, 1),
(5, '2026-07-09 18:12:47.313147', '2026-07-10 10:54:16.594414', 89.00, 99.00, 6.00, 78.00, 'COMPLETED', '2026-07-09 18:12:47.313743', 9, 1, 1),
(6, '2026-07-28 11:09:41.186198', NULL, 25.00, NULL, 0.00, 0.00, 'ACTIVE', '2026-07-28 11:09:41.187050', 3, 1, 1);

-- --------------------------------------------------------

--
-- Table structure for table `django_admin_log`
--

CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext DEFAULT NULL,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) UNSIGNED NOT NULL CHECK (`action_flag` >= 0),
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `django_admin_log`
--

INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES
(1, '2026-07-06 17:47:28.803482', '2', 'Tanay', 1, '[{\"added\": {}}]', 14, 1),
(2, '2026-07-06 17:47:55.186796', '2', 'Tanay', 2, '[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Email address\", \"Last login\", \"Address\", \"City\", \"State\", \"Pincode\"]}}]', 14, 1),
(3, '2026-07-06 17:53:30.747287', '1', 'BMW ix (abc8307)', 1, '[{\"added\": {}}]', 11, 1),
(4, '2026-07-06 17:58:47.832591', '3', 'TATA', 1, '[{\"added\": {}}]', 14, 1),
(5, '2026-07-06 17:59:12.751245', '3', 'TATA', 2, '[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Email address\", \"Last login\", \"Address\", \"City\", \"State\", \"Pincode\"]}}]', 14, 1),
(6, '2026-07-06 18:00:17.269811', '1', 'TORENT EV', 1, '[{\"added\": {}}]', 12, 1),
(7, '2026-07-06 18:12:50.082107', '4', 'Surat ➜ Ahmedabad', 1, '[{\"added\": {}}]', 13, 1),
(8, '2026-07-07 18:13:25.804957', '1', 'TORENT EV - AC-Fast', 1, '[{\"added\": {}}]', 7, 1),
(9, '2026-07-07 18:14:15.530768', '1', 'Booking #1', 1, '[{\"added\": {}}]', 6, 1),
(10, '2026-07-07 18:15:19.732795', '1', 'Session #1', 1, '[{\"added\": {}}]', 8, 1),
(11, '2026-07-07 18:48:23.223139', '2', 'Session #2', 1, '[{\"added\": {}}]', 8, 1),
(12, '2026-07-07 18:50:34.191751', '3', 'Session #3', 1, '[{\"added\": {}}]', 8, 1),
(13, '2026-07-08 17:57:09.414809', '1', 'desaitanay35@gmail.com - TORENT EV', 1, '[{\"added\": {}}]', 16, 1),
(14, '2026-07-08 18:02:03.654791', '2', 'desaitanay35@gmail.com - TORENT EV', 1, '[{\"added\": {}}]', 16, 1),
(15, '2026-07-09 10:17:08.252676', '5', 'Torent', 1, '[{\"added\": {}}]', 14, 1),
(16, '2026-07-09 10:17:40.284448', '5', 'Torent', 2, '[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Email address\", \"Last login\", \"Address\", \"City\", \"State\", \"Pincode\"]}}]', 14, 1),
(17, '2026-07-09 10:25:18.432198', '1', 'evchargex', 2, '[{\"changed\": {\"fields\": [\"Role\"]}}]', 14, 1),
(18, '2026-07-09 10:41:38.454867', '1', 'Booking #1', 2, '[]', 6, 1),
(19, '2026-07-09 10:42:34.553777', '2', 'Booking #2', 1, '[{\"added\": {}}]', 6, 1),
(20, '2026-07-09 17:17:41.407710', '4', 'Booking #4', 1, '[{\"added\": {}}]', 6, 1),
(21, '2026-07-09 17:21:41.268822', '4', 'Booking #4', 2, '[]', 6, 1),
(22, '2026-07-09 17:22:10.444762', '5', 'Booking #5', 1, '[{\"added\": {}}]', 6, 1),
(23, '2026-07-09 17:22:30.007145', '5', 'Booking #5', 2, '[{\"changed\": {\"fields\": [\"Booking status\"]}}]', 6, 1),
(24, '2026-07-09 17:22:37.372887', '5', 'Booking #5', 2, '[{\"changed\": {\"fields\": [\"Is qr used\"]}}]', 6, 1),
(25, '2026-07-09 17:22:55.101003', '5', 'Booking #5', 2, '[{\"changed\": {\"fields\": [\"Booking status\", \"Is qr used\"]}}]', 6, 1),
(26, '2026-07-09 17:26:33.188864', '6', 'Booking #6', 1, '[{\"added\": {}}]', 6, 1),
(27, '2026-07-09 17:45:05.089260', '1', 'TORENT EV - AC-Fast', 2, '[{\"changed\": {\"fields\": [\"Status\"]}}]', 7, 1),
(28, '2026-07-09 18:09:29.602489', '1', 'TORENT EV - AC-Fast', 2, '[{\"changed\": {\"fields\": [\"Status\"]}}]', 7, 1),
(29, '2026-07-09 18:24:11.260780', '2', 'Session #2', 2, '[{\"changed\": {\"fields\": [\"Session status\"]}}]', 8, 1),
(30, '2026-07-09 19:02:12.864392', '1', 'Payment #1 - PENDING', 2, '[{\"changed\": {\"fields\": [\"Charging session\"]}}]', 10, 1),
(31, '2026-07-11 10:52:07.005122', '1', 'TORENT EV', 2, '[{\"changed\": {\"fields\": [\"Latitude\", \"Longitude\"]}}]', 12, 1);

-- --------------------------------------------------------

--
-- Table structure for table `django_content_type`
--

CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `django_content_type`
--

INSERT INTO `django_content_type` (`id`, `app_label`, `model`) VALUES
(1, 'admin', 'logentry'),
(3, 'auth', 'group'),
(2, 'auth', 'permission'),
(17, 'authtoken', 'token'),
(18, 'authtoken', 'tokenproxy'),
(6, 'bookings', 'booking'),
(7, 'charging', 'charger'),
(8, 'charging', 'chargingsession'),
(4, 'contenttypes', 'contenttype'),
(16, 'favorites', 'favoritestation'),
(9, 'notifications', 'notification'),
(10, 'payments', 'payment'),
(15, 'reviews', 'review'),
(5, 'sessions', 'session'),
(12, 'stations', 'station'),
(13, 'trips', 'trip'),
(14, 'users', 'user'),
(11, 'vehicles', 'vehicle');

-- --------------------------------------------------------

--
-- Table structure for table `django_migrations`
--

CREATE TABLE `django_migrations` (
  `id` bigint(20) NOT NULL,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `django_migrations`
--

INSERT INTO `django_migrations` (`id`, `app`, `name`, `applied`) VALUES
(1, 'contenttypes', '0001_initial', '2026-07-06 17:12:10.670399'),
(2, 'contenttypes', '0002_remove_content_type_name', '2026-07-06 17:12:10.756036'),
(3, 'auth', '0001_initial', '2026-07-06 17:12:11.059433'),
(4, 'auth', '0002_alter_permission_name_max_length', '2026-07-06 17:12:11.157663'),
(5, 'auth', '0003_alter_user_email_max_length', '2026-07-06 17:12:11.163824'),
(6, 'auth', '0004_alter_user_username_opts', '2026-07-06 17:12:11.170722'),
(7, 'auth', '0005_alter_user_last_login_null', '2026-07-06 17:12:11.175854'),
(8, 'auth', '0006_require_contenttypes_0002', '2026-07-06 17:12:11.179001'),
(9, 'auth', '0007_alter_validators_add_error_messages', '2026-07-06 17:12:11.183346'),
(10, 'auth', '0008_alter_user_username_max_length', '2026-07-06 17:12:11.191443'),
(11, 'auth', '0009_alter_user_last_name_max_length', '2026-07-06 17:12:11.195627'),
(12, 'auth', '0010_alter_group_name_max_length', '2026-07-06 17:12:11.204087'),
(13, 'auth', '0011_update_proxy_permissions', '2026-07-06 17:12:11.210423'),
(14, 'auth', '0012_alter_user_first_name_max_length', '2026-07-06 17:12:11.215674'),
(15, 'users', '0001_initial', '2026-07-06 17:12:11.546409'),
(16, 'admin', '0001_initial', '2026-07-06 17:12:11.710400'),
(17, 'admin', '0002_logentry_remove_auto_add', '2026-07-06 17:12:11.720431'),
(18, 'admin', '0003_logentry_add_action_flag_choices', '2026-07-06 17:12:11.726850'),
(19, 'vehicles', '0001_initial', '2026-07-06 17:12:11.814598'),
(20, 'stations', '0001_initial', '2026-07-06 17:12:11.907753'),
(21, 'trips', '0001_initial', '2026-07-06 17:12:12.118919'),
(22, 'trips', '0002_remove_trip_destination_trip_destination_latitude_and_more', '2026-07-06 17:12:12.180375'),
(23, 'charging', '0001_initial', '2026-07-06 17:12:12.260037'),
(24, 'bookings', '0001_initial', '2026-07-06 17:12:12.529679'),
(25, 'charging', '0002_chargingsession', '2026-07-06 17:12:12.787842'),
(26, 'notifications', '0001_initial', '2026-07-06 17:12:12.890721'),
(27, 'payments', '0001_initial', '2026-07-06 17:12:13.104942'),
(28, 'sessions', '0001_initial', '2026-07-06 17:12:13.140432'),
(29, 'users', '0002_alter_user_phone', '2026-07-06 17:12:13.190960'),
(30, 'trips', '0003_trip_destination', '2026-07-06 18:11:00.479868'),
(31, 'reviews', '0001_initial', '2026-07-08 17:41:42.845550'),
(32, 'favorites', '0001_initial', '2026-07-08 17:53:51.131092'),
(33, 'bookings', '0002_booking_is_qr_used', '2026-07-09 11:29:07.931954'),
(34, 'notifications', '0002_alter_notification_notification_type_and_more', '2026-07-09 11:29:08.052352'),
(35, 'bookings', '0003_booking_is_verified', '2026-07-09 18:02:18.411512'),
(36, 'payments', '0002_remove_payment_bill_pdf_remove_payment_payment_date_and_more', '2026-07-09 18:43:47.911409'),
(37, 'notifications', '0003_alter_notification_notification_type_and_more', '2026-07-09 19:26:08.736814'),
(38, 'bookings', '0002_booking_is_qr_used_booking_is_verified', '2026-07-11 10:36:35.062693'),
(39, 'authtoken', '0001_initial', '2026-07-28 09:32:02.532981'),
(40, 'authtoken', '0002_auto_20160226_1747', '2026-07-28 09:32:02.608547'),
(41, 'authtoken', '0003_tokenproxy', '2026-07-28 09:32:02.616201'),
(42, 'authtoken', '0004_alter_tokenproxy_options', '2026-07-28 09:32:02.628899'),
(43, 'bookings', '0004_booking_qr_image_alter_booking_qr_code', '2026-07-28 09:32:02.921473'),
(44, 'stations', '0002_alter_station_latitude_alter_station_longitude', '2026-07-28 11:50:50.707394'),
(45, 'trips', '0004_trip_battery_before_trip_estimated_duration_and_more', '2026-07-28 11:50:51.161166');

-- --------------------------------------------------------

--
-- Table structure for table `django_session`
--

CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `django_session`
--

INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES
('j1wxkcv7d298plhmvm871r8hcd957bvl', '.eJxVjMsOgjAQRf-la9MUBqHj0j3fQOZVixpIKKyM_64kLHR7zzn35Qba1jxsxZZhVHdxlTv9bkzysGkHeqfpNnuZp3UZ2e-KP2jx_az2vB7u30Gmkr91G5KyKFJXC0k0OcckGCuurQPBxgIrYEClrm2RIaQEdSAwYBDCxr0_EwY4xA:1wgmv3:xMalOLW5ZUTm6tv2sP37FVVk8s--AUBoIp_i2MwME1M', '2026-07-20 17:15:45.201877'),
('r6yckj7wwbo1ghc1rsaxdyl0hbvy660a', '.eJxVjMsOgjAQRf-la9MUBqHj0j3fQOZVixpIKKyM_64kLHR7zzn35Qba1jxsxZZhVHdxlTv9bkzysGkHeqfpNnuZp3UZ2e-KP2jx_az2vB7u30Gmkr91G5KyKFJXC0k0OcckGCuurQPBxgIrYEClrm2RIaQEdSAwYBDCxr0_EwY4xA:1whWLc:Qn6JPHAULKYxzcm0Lz2D7ZX3UNtw84dcRSea_RB9rXM', '2026-07-22 17:46:12.897988');

-- --------------------------------------------------------

--
-- Table structure for table `favorites_favoritestation`
--

CREATE TABLE `favorites_favoritestation` (
  `id` bigint(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `station_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `notifications_notification`
--

CREATE TABLE `notifications_notification` (
  `id` bigint(20) NOT NULL,
  `title` varchar(100) NOT NULL,
  `message` longtext NOT NULL,
  `notification_type` varchar(20) NOT NULL,
  `is_read` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `notifications_notification`
--

INSERT INTO `notifications_notification` (`id`, `title`, `message`, `notification_type`, `is_read`, `created_at`, `user_id`) VALUES
(1, 'Booking Confirmed', 'Your booking #1 at TORENT EV for charger AC-Fast is confirmed on 2026-07-07 from 23:43:44 to 00:20:00.', 'BOOKING', 1, '2026-07-07 18:14:15.530335', 2),
(2, 'Charging Session Started', 'Charging session #1 has started for vehicle BMW ix. Current battery: 54%.', 'CHARGING', 1, '2026-07-07 18:15:19.727377', 2),
(3, 'Charging Session Started', 'Charging session #2 has started for vehicle BMW ix. Current battery: 20%.', 'CHARGING', 1, '2026-07-07 18:48:23.214890', 2),
(4, 'Charging Session Completed', 'Charging session #2 completed. Battery charged to 89%. Energy consumed: 56 kWh. Total cost: ₹569.', 'CHARGING', 1, '2026-07-07 18:48:23.216955', 2),
(5, 'Charging Session Started', 'Charging session #3 has started for vehicle BMW ix. Current battery: 20%.', 'CHARGING', 1, '2026-07-07 18:50:34.188113', 2),
(6, 'Charging Session Completed', 'Charging session #3 completed. Battery charged to 90.0%. Energy consumed: 42.00 kWh. Total cost: ₹546.00.', 'CHARGING', 1, '2026-07-07 19:13:39.647583', 2),
(7, 'Payment Pending', 'Payment of ₹546.00 failed (Transaction: TXN-C102D34AA1).', 'PAYMENT', 1, '2026-07-07 19:13:39.657451', 2),
(8, 'Booking Confirmed', 'Your booking #2 at TORENT EV for charger AC-Fast is confirmed on 2026-07-09 from 17:12:03 to 18:00:00.', 'BOOKING', 1, '2026-07-09 10:42:34.550963', 2),
(9, 'Booking Confirmed', 'Your booking #3 at TORENT EV for charger AC-Fast is confirmed on 2026-07-09 from 18:00:00 to 19:00:00.', 'BOOKING', 1, '2026-07-09 10:56:17.153206', 2),
(10, 'Charging Session Completed', 'Charging session #1 completed. Battery charged to 85.0%. Energy consumed: 18.60 kWh. Total cost: ₹241.80.', 'CHARGING', 1, '2026-07-09 17:10:37.852248', 2),
(11, 'Payment Pending', 'Payment of ₹241.80 failed (Transaction: TXN-A87BB0BD1A).', 'PAYMENT', 1, '2026-07-09 17:10:37.864374', 2),
(12, 'Booking Confirmed', 'Your booking #4 at TORENT EV for charger AC-Fast is confirmed on 2026-07-09 from 22:47:19 to 23:11:00.', 'BOOKING', 1, '2026-07-09 17:17:41.397494', 2),
(13, 'Booking Confirmed', 'Your booking #5 at TORENT EV for charger AC-Fast is confirmed on 2026-07-09 from 22:52:03 to 22:52:04.', 'BOOKING', 1, '2026-07-09 17:22:10.442979', 2),
(14, 'Booking Confirmed', 'Your booking #6 at TORENT EV for charger AC-Fast is confirmed on 2026-07-09 from 22:56:27 to 22:56:28.', 'BOOKING', 1, '2026-07-09 17:26:33.183058', 2),
(15, 'Booking Confirmed', 'Your booking #7 at TORENT EV for charger AC-Fast is confirmed on 2026-07-10 from 18:00:00 to 19:00:00.', 'BOOKING', 1, '2026-07-09 17:28:12.941885', 2),
(16, 'Booking Confirmed', 'Your booking #8 at TORENT EV for charger AC-Fast is confirmed on 2026-07-10 from 20:00:00 to 21:00:00.', 'BOOKING', 1, '2026-07-09 17:45:08.989930', 2),
(17, 'Charging Session Started', 'Charging session #4 has started for vehicle BMW ix. Current battery: 89.0%.', 'CHARGING', 1, '2026-07-09 17:47:00.359529', 2),
(18, 'Booking Confirmed', 'Your booking #9 at TORENT EV for charger AC-Fast is confirmed on 2026-07-10 from 19:00:00 to 20:00:00.', 'BOOKING', 1, '2026-07-09 18:09:34.018319', 2),
(19, 'Charging Session Started', 'Charging session #5 has started for vehicle BMW ix. Current battery: 89.00%.', 'CHARGING', 1, '2026-07-09 18:12:47.320759', 2),
(20, 'Charging Session Started', 'Charging session #2 has started for vehicle BMW ix. Current battery: 20.00%.', 'CHARGING', 1, '2026-07-09 18:24:11.256231', 2),
(21, 'Charging Session Completed', 'Charging session #2 completed. Battery charged to 80%. Energy consumed: 56.00 kWh. Total cost: ₹569.00.', 'CHARGING', 1, '2026-07-09 18:24:35.120875', 2),
(22, 'Payment Success', 'Payment of ₹546.00 was successful (Transaction: TXN-90A7B3573F).', 'PAYMENT', 1, '2026-07-09 19:22:36.096791', 2),
(23, 'Charging Session Completed', 'Charging session #4 completed. Battery charged to 91.40%. Energy consumed: 1.44000 kWh. Total cost: ₹18.7200000.', 'CHARGING', 1, '2026-07-10 07:44:30.821738', 2),
(24, 'Charger Available', 'AC-Fast is now available.', 'CHARGING', 1, '2026-07-10 10:54:16.635133', 2),
(25, 'Charging Completed', 'Charging completed successfully.\nEnergy: 6.000 kWh\nCost: ₹78.00000', 'CHARGING', 1, '2026-07-10 10:54:16.639564', 2),
(26, 'Charging Session Started', 'Charging session #6 has started for vehicle BMW ix. Current battery: 25.00%.', 'CHARGING', 0, '2026-07-28 11:09:41.196884', 2),
(27, 'Charging Started', 'Charging has started on AC-Fast.', 'CHARGING', 0, '2026-07-28 11:09:41.199622', 2);

-- --------------------------------------------------------

--
-- Table structure for table `payments_payment`
--

CREATE TABLE `payments_payment` (
  `id` bigint(20) NOT NULL,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(20) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `payment_status` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `charging_session_id` bigint(20) DEFAULT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `payment_otp` varchar(6) DEFAULT NULL,
  `otp_sent_at` datetime(6) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `payments_payment`
--

INSERT INTO `payments_payment` (`id`, `amount`, `payment_method`, `transaction_id`, `payment_status`, `created_at`, `user_id`, `charging_session_id`, `paid_at`, `payment_otp`, `otp_sent_at`) VALUES
(1, 546.00, 'UPI', 'TXN-90A7B3573F', 'SUCCESS', '2026-07-07 19:13:39.654837', 2, 1, '2026-07-09 19:22:36.079638', NULL, NULL),
(2, 241.80, 'UPI', 'TXN-A87BB0BD1A', 'PENDING', '2026-07-09 17:10:37.861699', 2, NULL, NULL, NULL, NULL),
(3, 78.00, NULL, NULL, 'PENDING', '2026-07-10 10:54:16.642489', 2, 5, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `reviews_review`
--

CREATE TABLE `reviews_review` (
  `id` bigint(20) NOT NULL,
  `rating` smallint(5) UNSIGNED NOT NULL CHECK (`rating` >= 0),
  `comment` longtext DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `station_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `reviews_review`
--

INSERT INTO `reviews_review` (`id`, `rating`, `comment`, `created_at`, `updated_at`, `station_id`, `user_id`) VALUES
(1, 5, 'Excellent charging station.', '2026-07-08 17:49:31.173403', '2026-07-08 17:49:31.173421', 1, 2);

-- --------------------------------------------------------

--
-- Table structure for table `stations_station`
--

CREATE TABLE `stations_station` (
  `id` bigint(20) NOT NULL,
  `station_name` varchar(100) NOT NULL,
  `address` longtext NOT NULL,
  `city` varchar(50) NOT NULL,
  `state` varchar(50) NOT NULL,
  `pincode` varchar(10) NOT NULL,
  `latitude` decimal(12,8) NOT NULL,
  `longitude` decimal(12,8) NOT NULL,
  `opening_time` time(6) NOT NULL,
  `closing_time` time(6) NOT NULL,
  `contact_number` varchar(15) NOT NULL,
  `email` varchar(254) NOT NULL,
  `amenities` longtext DEFAULT NULL,
  `rating` decimal(2,1) NOT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `operator_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `stations_station`
--

INSERT INTO `stations_station` (`id`, `station_name`, `address`, `city`, `state`, `pincode`, `latitude`, `longitude`, `opening_time`, `closing_time`, `contact_number`, `email`, `amenities`, `rating`, `status`, `created_at`, `operator_id`) VALUES
(1, 'TORENT EV', '13/156 gokul apt,parasnagar, sola road ,ahmedabad', 'Ahmedabad', 'Gujarat', '380063', 23.05517760, 72.54399390, '06:00:00.000000', '23:29:54.000000', '8959632689', 'desaitanay35@gmail.com', '', 5.0, 'OPEN', '2026-07-06 18:00:17.268733', 3),
(2, 'Torrent Power EV Hub - Gandhinagar', 'Infocity Road, Near Indroda Circle', 'Gandhinagar', 'Gujarat', '382007', 23.18741230, 72.62864560, '00:00:00.000000', '23:59:00.000000', '9898980001', 'gandhinagar@torrentpower.com', 'Cafeteria, Restroom, Free Wi-Fi', 4.8, 'OPEN', '2026-07-28 10:04:20.581025', 5),
(3, 'Tata Power EV Zone - Vadodara', 'Sayajigunj Circle, Opposite Railway Station', 'Vadodara', 'Gujarat', '390002', 22.31067890, 73.18123450, '06:00:00.000000', '23:00:00.000000', '9898980002', 'vadodara@tatapower.com', 'Waiting Lounge, Restroom, Coffee Shop', 4.5, 'OPEN', '2026-07-28 10:04:20.606951', 3),
(4, 'Tata Power EV Zone - Surat', 'Vesu Main Road, Near VIP Road Circle', 'Surat', 'Gujarat', '395007', 21.14190120, 72.77839870, '00:00:00.000000', '23:59:00.000000', '9898980003', 'surat@tatapower.com', 'Restroom, Shopping Mall Proximity', 4.6, 'OPEN', '2026-07-28 10:04:20.627424', 3),
(5, 'Tata Power EV Zone - Rajkot', 'Kalawad Road, Opposite Crystal Mall', 'Rajkot', 'Gujarat', '360005', 22.28565430, 70.77443210, '08:00:00.000000', '22:00:00.000000', '9898980004', 'rajkot@tatapower.com', 'Restroom, Food Court Proximity', 4.2, 'OPEN', '2026-07-28 10:04:20.638715', 3),
(6, 'Tata Power Hub - Ahmedabad Market Street #1', 'Plot 11, Market Street, Ahmedabad, Gujarat', 'Ahmedabad', 'Gujarat', '380090', 22.99750770, 72.59982450, '08:00:00.000000', '22:59:00.000000', '9819471938', 'support.ahmedabad@tatapower.com', 'Restroom, Food Court Proximity', 4.2, 'OPEN', '2026-07-28 10:08:26.958650', 3),
(7, 'Adani Gas EV Hub - Ahmedabad VIP Road #2', 'Plot 486, VIP Road, Ahmedabad, Gujarat', 'Ahmedabad', 'Gujarat', '380050', 23.05854720, 72.53463950, '00:00:00.000000', '23:59:00.000000', '9885184822', 'support.ahmedabad@adanigasev.com', 'Restroom, Coffee Shop', 4.7, 'OPEN', '2026-07-28 10:08:26.983637', 5),
(8, 'Zeon Charging Hub - Ahmedabad Airport Road #3', 'Plot 404, Airport Road, Ahmedabad, Gujarat', 'Ahmedabad', 'Gujarat', '380023', 23.03097920, 72.57681710, '06:00:00.000000', '22:00:00.000000', '9876665181', 'support.ahmedabad@zeoncharging.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 4.3, 'OPEN', '2026-07-28 10:08:27.014580', 3),
(9, 'Jio-bp Pulse Hub - Ahmedabad Station Road #4', 'Plot 155, Station Road, Ahmedabad, Gujarat', 'Ahmedabad', 'Gujarat', '380062', 23.04914970, 72.53777430, '00:00:00.000000', '23:00:00.000000', '9865232816', 'support.ahmedabad@jiobppulse.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 4.0, 'OPEN', '2026-07-28 10:08:27.039898', 3),
(10, 'Adani Gas EV Hub - Ahmedabad Station Road #5', 'Plot 129, Station Road, Ahmedabad, Gujarat', 'Ahmedabad', 'Gujarat', '380062', 23.04791550, 72.55629720, '06:00:00.000000', '22:59:00.000000', '9834361420', 'support.ahmedabad@adanigasev.com', 'Restroom, Coffee Shop', 4.5, 'OPEN', '2026-07-28 10:08:27.059516', 5),
(11, 'Adani Gas EV Hub - Ahmedabad Market Street #6', 'Plot 26, Market Street, Ahmedabad, Gujarat', 'Ahmedabad', 'Gujarat', '380056', 22.98900580, 72.54444210, '00:00:00.000000', '22:59:00.000000', '9888953391', 'support.ahmedabad@adanigasev.com', 'Food Stall, Restroom', 4.2, 'OPEN', '2026-07-28 10:08:27.090174', 5),
(12, 'Torrent Power Hub - Ahmedabad Airport Road #7', 'Plot 30, Airport Road, Ahmedabad, Gujarat', 'Ahmedabad', 'Gujarat', '380058', 22.98750860, 72.58804070, '06:00:00.000000', '23:00:00.000000', '9822241514', 'support.ahmedabad@torrentpower.com', 'Restroom, Convenience Store', 4.0, 'OPEN', '2026-07-28 10:08:27.115071', 5),
(13, 'Zeon Charging Hub - Ahmedabad Market Street #8', 'Plot 415, Market Street, Ahmedabad, Gujarat', 'Ahmedabad', 'Gujarat', '380049', 23.03596360, 72.57518900, '06:00:00.000000', '23:00:00.000000', '9899655586', 'support.ahmedabad@zeoncharging.com', 'Cafeteria, Restroom, Wi-Fi', 3.9, 'OPEN', '2026-07-28 10:08:27.140889', 3),
(14, 'Adani Gas EV Hub - Ahmedabad Ring Road #9', 'Plot 173, Ring Road, Ahmedabad, Gujarat', 'Ahmedabad', 'Gujarat', '380026', 23.03648800, 72.60763220, '06:00:00.000000', '23:00:00.000000', '9812439107', 'support.ahmedabad@adanigasev.com', 'Restroom, Convenience Store', 4.8, 'OPEN', '2026-07-28 10:08:27.171745', 5),
(15, 'Tata Power Hub - Ahmedabad VIP Road #10', 'Plot 244, VIP Road, Ahmedabad, Gujarat', 'Ahmedabad', 'Gujarat', '380033', 23.00132840, 72.55233340, '06:00:00.000000', '23:59:00.000000', '9843666177', 'support.ahmedabad@tatapower.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 4.0, 'OPEN', '2026-07-28 10:08:27.192748', 3),
(16, 'Tata Power Hub - Surat GIDC Sector 2 #1', 'Plot 14, GIDC Sector 2, Surat, Gujarat', 'Surat', 'Gujarat', '395031', 21.18346780, 72.86586190, '08:00:00.000000', '22:59:00.000000', '9823564060', 'support.surat@tatapower.com', 'Restroom, Coffee Shop', 3.9, 'OPEN', '2026-07-28 10:08:27.218931', 3),
(17, 'Adani Gas EV Hub - Surat GIDC Sector 2 #2', 'Plot 70, GIDC Sector 2, Surat, Gujarat', 'Surat', 'Gujarat', '395058', 21.13202180, 72.82483240, '06:00:00.000000', '22:00:00.000000', '9892501743', 'support.surat@adanigasev.com', 'Restroom, Shopping Mall Proximity', 4.3, 'OPEN', '2026-07-28 10:08:27.234110', 5),
(18, 'Tata Power Hub - Surat Main Road #3', 'Plot 422, Main Road, Surat, Gujarat', 'Surat', 'Gujarat', '395024', 21.13823340, 72.84098800, '06:00:00.000000', '23:00:00.000000', '9811545645', 'support.surat@tatapower.com', 'Cafeteria, Restroom, Wi-Fi', 4.5, 'OPEN', '2026-07-28 10:08:27.255277', 3),
(19, 'Torrent Power Hub - Surat Highway 48 Bypass #4', 'Plot 440, Highway 48 Bypass, Surat, Gujarat', 'Surat', 'Gujarat', '395066', 21.13196560, 72.81653660, '06:00:00.000000', '23:00:00.000000', '9868896459', 'support.surat@torrentpower.com', 'Restroom, Convenience Store', 4.0, 'OPEN', '2026-07-28 10:08:27.280559', 5),
(20, 'Jio-bp Pulse Hub - Surat Highway 48 Bypass #5', 'Plot 305, Highway 48 Bypass, Surat, Gujarat', 'Surat', 'Gujarat', '395029', 21.17156160, 72.84142490, '06:00:00.000000', '22:00:00.000000', '9850202144', 'support.surat@jiobppulse.com', 'Restroom, Supermarket Proximity', 4.8, 'OPEN', '2026-07-28 10:08:27.314603', 3),
(21, 'Torrent Power Hub - Surat Link Road #6', 'Plot 369, Link Road, Surat, Gujarat', 'Surat', 'Gujarat', '395062', 21.17605950, 72.84205950, '08:00:00.000000', '22:00:00.000000', '9876824270', 'support.surat@torrentpower.com', 'Restroom, Coffee Shop', 4.3, 'OPEN', '2026-07-28 10:08:27.329766', 5),
(22, 'Adani Gas EV Hub - Surat Ring Road #7', 'Plot 485, Ring Road, Surat, Gujarat', 'Surat', 'Gujarat', '395055', 21.18674630, 72.83351070, '06:00:00.000000', '22:59:00.000000', '9826081286', 'support.surat@adanigasev.com', 'Restroom, Convenience Store', 4.6, 'OPEN', '2026-07-28 10:08:27.349529', 5),
(23, 'Jio-bp Pulse Hub - Surat GIDC Sector 2 #8', 'Plot 424, GIDC Sector 2, Surat, Gujarat', 'Surat', 'Gujarat', '395015', 21.18480650, 72.79415860, '06:00:00.000000', '22:00:00.000000', '9899712214', 'support.surat@jiobppulse.com', 'Food Stall, Restroom', 3.9, 'OPEN', '2026-07-28 10:08:27.374507', 3),
(24, 'Adani Gas EV Hub - Surat VIP Road #9', 'Plot 157, VIP Road, Surat, Gujarat', 'Surat', 'Gujarat', '395081', 21.17609810, 72.80760790, '08:00:00.000000', '22:59:00.000000', '9898848190', 'support.surat@adanigasev.com', 'Food Stall, Restroom', 4.3, 'OPEN', '2026-07-28 10:08:27.394770', 5),
(25, 'Jio-bp Pulse Hub - Surat Market Street #10', 'Plot 453, Market Street, Surat, Gujarat', 'Surat', 'Gujarat', '395036', 21.16842740, 72.79169320, '06:00:00.000000', '23:59:00.000000', '9861939887', 'support.surat@jiobppulse.com', 'Restroom, Supermarket Proximity', 4.3, 'OPEN', '2026-07-28 10:08:27.416260', 3),
(26, 'Jio-bp Pulse Hub - Vadodara Main Road #1', 'Plot 382, Main Road, Vadodara, Gujarat', 'Vadodara', 'Gujarat', '390036', 22.33106820, 73.17313270, '00:00:00.000000', '22:59:00.000000', '9838215737', 'support.vadodara@jiobppulse.com', 'Restroom, Supermarket Proximity', 4.2, 'OPEN', '2026-07-28 10:08:27.439156', 3),
(27, 'Adani Gas EV Hub - Vadodara College Road #2', 'Plot 109, College Road, Vadodara, Gujarat', 'Vadodara', 'Gujarat', '390023', 22.30790560, 73.20153090, '08:00:00.000000', '22:59:00.000000', '9831899296', 'support.vadodara@adanigasev.com', 'Restroom, Supermarket Proximity', 3.9, 'OPEN', '2026-07-28 10:08:27.465525', 5),
(28, 'Adani Gas EV Hub - Vadodara Ring Road #3', 'Plot 149, Ring Road, Vadodara, Gujarat', 'Vadodara', 'Gujarat', '390067', 22.30072270, 73.22043600, '00:00:00.000000', '22:59:00.000000', '9822553702', 'support.vadodara@adanigasev.com', 'Cafeteria, Restroom, Wi-Fi', 4.1, 'OPEN', '2026-07-28 10:08:27.491713', 5),
(29, 'Torrent Power Hub - Vadodara College Road #4', 'Plot 325, College Road, Vadodara, Gujarat', 'Vadodara', 'Gujarat', '390026', 22.34213510, 73.18632780, '00:00:00.000000', '23:59:00.000000', '9826051860', 'support.vadodara@torrentpower.com', 'Restroom, Supermarket Proximity', 4.4, 'OPEN', '2026-07-28 10:08:27.516649', 5),
(30, 'Adani Gas EV Hub - Vadodara Ring Road #5', 'Plot 199, Ring Road, Vadodara, Gujarat', 'Vadodara', 'Gujarat', '390020', 22.27040760, 73.14778140, '00:00:00.000000', '23:59:00.000000', '9831449608', 'support.vadodara@adanigasev.com', 'Cafeteria, Restroom, Wi-Fi', 4.5, 'OPEN', '2026-07-28 10:08:27.541141', 5),
(31, 'Tata Power Hub - Vadodara Link Road #6', 'Plot 26, Link Road, Vadodara, Gujarat', 'Vadodara', 'Gujarat', '390087', 22.27240210, 73.15054480, '06:00:00.000000', '23:00:00.000000', '9841430141', 'support.vadodara@tatapower.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 3.9, 'OPEN', '2026-07-28 10:08:27.558462', 3),
(32, 'Torrent Power Hub - Vadodara Ring Road #7', 'Plot 347, Ring Road, Vadodara, Gujarat', 'Vadodara', 'Gujarat', '390053', 22.32654770, 73.18205780, '08:00:00.000000', '22:00:00.000000', '9891958395', 'support.vadodara@torrentpower.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 4.3, 'OPEN', '2026-07-28 10:08:27.570853', 5),
(33, 'Jio-bp Pulse Hub - Vadodara City Center Road #8', 'Plot 127, City Center Road, Vadodara, Gujarat', 'Vadodara', 'Gujarat', '390039', 22.26861630, 73.18540170, '00:00:00.000000', '22:59:00.000000', '9868041815', 'support.vadodara@jiobppulse.com', 'Restroom, Food Court Proximity', 4.7, 'OPEN', '2026-07-28 10:08:27.595401', 3),
(34, 'Jio-bp Pulse Hub - Vadodara Highway 48 Bypass #9', 'Plot 343, Highway 48 Bypass, Vadodara, Gujarat', 'Vadodara', 'Gujarat', '390027', 22.33284660, 73.18157520, '08:00:00.000000', '22:59:00.000000', '9837097955', 'support.vadodara@jiobppulse.com', 'Restroom, Convenience Store', 4.6, 'OPEN', '2026-07-28 10:08:27.611690', 3),
(35, 'Jio-bp Pulse Hub - Vadodara Ring Road #10', 'Plot 105, Ring Road, Vadodara, Gujarat', 'Vadodara', 'Gujarat', '390049', 22.27334400, 73.19601030, '00:00:00.000000', '23:00:00.000000', '9830308828', 'support.vadodara@jiobppulse.com', 'Restroom, Coffee Shop', 4.7, 'OPEN', '2026-07-28 10:08:27.636153', 3),
(36, 'Tata Power Hub - Rajkot Market Street #1', 'Plot 128, Market Street, Rajkot, Gujarat', 'Rajkot', 'Gujarat', '360036', 22.32461050, 70.83089020, '00:00:00.000000', '23:59:00.000000', '9819070678', 'support.rajkot@tatapower.com', 'Restroom, Shopping Mall Proximity', 4.2, 'OPEN', '2026-07-28 10:08:27.656934', 3),
(37, 'Tata Power Hub - Rajkot Main Road #2', 'Plot 217, Main Road, Rajkot, Gujarat', 'Rajkot', 'Gujarat', '360029', 22.29960780, 70.79318490, '08:00:00.000000', '22:59:00.000000', '9869508672', 'support.rajkot@tatapower.com', 'Restroom, Food Court Proximity', 4.7, 'OPEN', '2026-07-28 10:08:27.677804', 3),
(38, 'Jio-bp Pulse Hub - Rajkot Industrial Area Road #3', 'Plot 270, Industrial Area Road, Rajkot, Gujarat', 'Rajkot', 'Gujarat', '360068', 22.29063890, 70.78283610, '06:00:00.000000', '23:59:00.000000', '9826060083', 'support.rajkot@jiobppulse.com', 'Restroom, Supermarket Proximity', 3.9, 'OPEN', '2026-07-28 10:08:27.698683', 3),
(39, 'Torrent Power Hub - Rajkot Market Street #4', 'Plot 480, Market Street, Rajkot, Gujarat', 'Rajkot', 'Gujarat', '360060', 22.32853780, 70.76494900, '06:00:00.000000', '23:00:00.000000', '9846608468', 'support.rajkot@torrentpower.com', 'Restroom, Shopping Mall Proximity', 4.8, 'OPEN', '2026-07-28 10:08:27.712564', 5),
(40, 'Zeon Charging Hub - Rajkot Link Road #5', 'Plot 376, Link Road, Rajkot, Gujarat', 'Rajkot', 'Gujarat', '360097', 22.29414620, 70.76947960, '00:00:00.000000', '23:00:00.000000', '9865118017', 'support.rajkot@zeoncharging.com', 'Restroom, Shopping Mall Proximity', 4.7, 'OPEN', '2026-07-28 10:08:27.738780', 3),
(41, 'Jio-bp Pulse Hub - Rajkot Ring Road #6', 'Plot 461, Ring Road, Rajkot, Gujarat', 'Rajkot', 'Gujarat', '360021', 22.30225460, 70.78795170, '06:00:00.000000', '22:00:00.000000', '9823002751', 'support.rajkot@jiobppulse.com', 'Restroom, Coffee Shop', 4.3, 'OPEN', '2026-07-28 10:08:27.750796', 3),
(42, 'Zeon Charging Hub - Rajkot Airport Road #7', 'Plot 284, Airport Road, Rajkot, Gujarat', 'Rajkot', 'Gujarat', '360069', 22.32357260, 70.82377930, '08:00:00.000000', '23:59:00.000000', '9849673888', 'support.rajkot@zeoncharging.com', 'Restroom, Convenience Store', 4.1, 'OPEN', '2026-07-28 10:08:27.779391', 3),
(43, 'Adani Gas EV Hub - Rajkot Link Road #8', 'Plot 18, Link Road, Rajkot, Gujarat', 'Rajkot', 'Gujarat', '360029', 22.26446960, 70.81661800, '08:00:00.000000', '22:59:00.000000', '9893121482', 'support.rajkot@adanigasev.com', 'Food Stall, Restroom', 4.6, 'OPEN', '2026-07-28 10:08:27.803647', 5),
(44, 'Jio-bp Pulse Hub - Rajkot Airport Road #9', 'Plot 221, Airport Road, Rajkot, Gujarat', 'Rajkot', 'Gujarat', '360053', 22.29074410, 70.80873670, '06:00:00.000000', '22:59:00.000000', '9845059349', 'support.rajkot@jiobppulse.com', 'Restroom, Coffee Shop', 4.5, 'OPEN', '2026-07-28 10:08:27.824352', 3),
(45, 'Adani Gas EV Hub - Rajkot College Road #10', 'Plot 51, College Road, Rajkot, Gujarat', 'Rajkot', 'Gujarat', '360035', 22.26667650, 70.83799630, '00:00:00.000000', '22:00:00.000000', '9893030264', 'support.rajkot@adanigasev.com', 'Restroom, Shopping Mall Proximity', 4.7, 'OPEN', '2026-07-28 10:08:27.836424', 5),
(46, 'Jio-bp Pulse Hub - Gandhinagar Highway 48 Bypass #1', 'Plot 352, Highway 48 Bypass, Gandhinagar, Gujarat', 'Gandhinagar', 'Gujarat', '382032', 23.18180060, 72.60763120, '06:00:00.000000', '22:00:00.000000', '9843554532', 'support.gandhinagar@jiobppulse.com', 'Restroom, Convenience Store', 4.3, 'OPEN', '2026-07-28 10:08:27.856929', 3),
(47, 'Zeon Charging Hub - Gandhinagar College Road #2', 'Plot 390, College Road, Gandhinagar, Gujarat', 'Gandhinagar', 'Gujarat', '382080', 23.24479510, 72.59932210, '06:00:00.000000', '23:00:00.000000', '9818040365', 'support.gandhinagar@zeoncharging.com', 'Restroom, Supermarket Proximity', 4.3, 'OPEN', '2026-07-28 10:08:27.881332', 3),
(48, 'Tata Power Hub - Gandhinagar Station Road #3', 'Plot 64, Station Road, Gandhinagar, Gujarat', 'Gandhinagar', 'Gujarat', '382013', 23.23133420, 72.60352160, '08:00:00.000000', '22:00:00.000000', '9883415651', 'support.gandhinagar@tatapower.com', 'Cafeteria, Restroom, Wi-Fi', 4.4, 'OPEN', '2026-07-28 10:08:27.893508', 3),
(49, 'Zeon Charging Hub - Gandhinagar GIDC Sector 2 #4', 'Plot 145, GIDC Sector 2, Gandhinagar, Gujarat', 'Gandhinagar', 'Gujarat', '382049', 23.23812520, 72.66312630, '00:00:00.000000', '23:59:00.000000', '9873214856', 'support.gandhinagar@zeoncharging.com', 'Restroom, Food Court Proximity', 4.8, 'OPEN', '2026-07-28 10:08:27.909974', 3),
(50, 'Torrent Power Hub - Gandhinagar VIP Road #5', 'Plot 430, VIP Road, Gandhinagar, Gujarat', 'Gandhinagar', 'Gujarat', '382019', 23.18405530, 72.62335380, '08:00:00.000000', '23:00:00.000000', '9891360043', 'support.gandhinagar@torrentpower.com', 'Restroom, Food Court Proximity', 4.3, 'OPEN', '2026-07-28 10:08:27.934293', 5),
(51, 'Adani Gas EV Hub - Gandhinagar VIP Road #6', 'Plot 294, VIP Road, Gandhinagar, Gujarat', 'Gandhinagar', 'Gujarat', '382056', 23.19047100, 72.64266570, '00:00:00.000000', '22:00:00.000000', '9848560971', 'support.gandhinagar@adanigasev.com', 'Restroom, Convenience Store', 4.5, 'OPEN', '2026-07-28 10:08:27.956670', 5),
(52, 'Zeon Charging Hub - Gandhinagar VIP Road #7', 'Plot 496, VIP Road, Gandhinagar, Gujarat', 'Gandhinagar', 'Gujarat', '382023', 23.18345280, 72.60632580, '00:00:00.000000', '22:00:00.000000', '9864410426', 'support.gandhinagar@zeoncharging.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 4.5, 'OPEN', '2026-07-28 10:08:27.977105', 3),
(53, 'Tata Power Hub - Gandhinagar Industrial Area Road #8', 'Plot 357, Industrial Area Road, Gandhinagar, Gujarat', 'Gandhinagar', 'Gujarat', '382058', 23.21360180, 72.62340970, '06:00:00.000000', '22:00:00.000000', '9829008313', 'support.gandhinagar@tatapower.com', 'Restroom, Coffee Shop', 4.2, 'OPEN', '2026-07-28 10:08:27.993628', 3),
(54, 'Jio-bp Pulse Hub - Gandhinagar Main Road #9', 'Plot 165, Main Road, Gandhinagar, Gujarat', 'Gandhinagar', 'Gujarat', '382074', 23.24252380, 72.61510550, '08:00:00.000000', '23:00:00.000000', '9872571909', 'support.gandhinagar@jiobppulse.com', 'Restroom, Supermarket Proximity', 3.8, 'OPEN', '2026-07-28 10:08:28.010468', 3),
(55, 'Jio-bp Pulse Hub - Gandhinagar College Road #10', 'Plot 365, College Road, Gandhinagar, Gujarat', 'Gandhinagar', 'Gujarat', '382091', 23.20037280, 72.60290080, '00:00:00.000000', '23:00:00.000000', '9852400629', 'support.gandhinagar@jiobppulse.com', 'Restroom, Convenience Store', 3.9, 'OPEN', '2026-07-28 10:08:28.032798', 3),
(56, 'Zeon Charging Hub - Bhavnagar Market Street #1', 'Plot 118, Market Street, Bhavnagar, Gujarat', 'Bhavnagar', 'Gujarat', '364082', 21.75135330, 72.15700450, '06:00:00.000000', '23:59:00.000000', '9887375199', 'support.bhavnagar@zeoncharging.com', 'Restroom, Coffee Shop', 4.0, 'OPEN', '2026-07-28 10:08:28.045543', 3),
(57, 'Zeon Charging Hub - Bhavnagar Airport Road #2', 'Plot 15, Airport Road, Bhavnagar, Gujarat', 'Bhavnagar', 'Gujarat', '364054', 21.80105730, 72.12226570, '00:00:00.000000', '23:00:00.000000', '9816896111', 'support.bhavnagar@zeoncharging.com', 'Restroom, Convenience Store', 4.7, 'OPEN', '2026-07-28 10:08:28.067046', 3),
(58, 'Tata Power Hub - Bhavnagar Main Road #3', 'Plot 381, Main Road, Bhavnagar, Gujarat', 'Bhavnagar', 'Gujarat', '364086', 21.78204720, 72.15652310, '08:00:00.000000', '23:00:00.000000', '9849837444', 'support.bhavnagar@tatapower.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 4.2, 'OPEN', '2026-07-28 10:08:28.096748', 3),
(59, 'Zeon Charging Hub - Bhavnagar City Center Road #4', 'Plot 138, City Center Road, Bhavnagar, Gujarat', 'Bhavnagar', 'Gujarat', '364025', 21.75078130, 72.13096060, '08:00:00.000000', '22:59:00.000000', '9895160883', 'support.bhavnagar@zeoncharging.com', 'Restroom, Supermarket Proximity', 4.2, 'OPEN', '2026-07-28 10:08:28.115278', 3),
(60, 'Tata Power Hub - Bhavnagar Main Road #5', 'Plot 250, Main Road, Bhavnagar, Gujarat', 'Bhavnagar', 'Gujarat', '364096', 21.78531920, 72.16804840, '08:00:00.000000', '23:00:00.000000', '9889515931', 'support.bhavnagar@tatapower.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 4.5, 'OPEN', '2026-07-28 10:08:28.133562', 3),
(61, 'Torrent Power Hub - Bhavnagar Station Road #6', 'Plot 265, Station Road, Bhavnagar, Gujarat', 'Bhavnagar', 'Gujarat', '364088', 21.78467340, 72.14977330, '08:00:00.000000', '23:59:00.000000', '9838609248', 'support.bhavnagar@torrentpower.com', 'Restroom, Supermarket Proximity', 4.7, 'OPEN', '2026-07-28 10:08:28.155207', 5),
(62, 'Adani Gas EV Hub - Bhavnagar Ring Road #7', 'Plot 347, Ring Road, Bhavnagar, Gujarat', 'Bhavnagar', 'Gujarat', '364037', 21.74990940, 72.18903760, '00:00:00.000000', '22:59:00.000000', '9886634231', 'support.bhavnagar@adanigasev.com', 'Restroom, Convenience Store', 4.7, 'OPEN', '2026-07-28 10:08:28.176525', 5),
(63, 'Tata Power Hub - Bhavnagar Airport Road #8', 'Plot 303, Airport Road, Bhavnagar, Gujarat', 'Bhavnagar', 'Gujarat', '364020', 21.77677510, 72.11535780, '00:00:00.000000', '22:00:00.000000', '9891834179', 'support.bhavnagar@tatapower.com', 'Food Stall, Restroom', 4.0, 'OPEN', '2026-07-28 10:08:28.195346', 3),
(64, 'Zeon Charging Hub - Bhavnagar Industrial Area Road #9', 'Plot 119, Industrial Area Road, Bhavnagar, Gujarat', 'Bhavnagar', 'Gujarat', '364095', 21.80131590, 72.18025660, '00:00:00.000000', '23:00:00.000000', '9861364859', 'support.bhavnagar@zeoncharging.com', 'Restroom, Food Court Proximity', 4.8, 'OPEN', '2026-07-28 10:08:28.222338', 3),
(65, 'Zeon Charging Hub - Bhavnagar Market Street #10', 'Plot 300, Market Street, Bhavnagar, Gujarat', 'Bhavnagar', 'Gujarat', '364092', 21.78844940, 72.16916980, '06:00:00.000000', '22:00:00.000000', '9829909592', 'support.bhavnagar@zeoncharging.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 4.1, 'OPEN', '2026-07-28 10:08:28.242134', 3),
(66, 'Tata Power Hub - Jamnagar Highway 48 Bypass #1', 'Plot 318, Highway 48 Bypass, Jamnagar, Gujarat', 'Jamnagar', 'Gujarat', '361061', 22.47238080, 70.06085350, '06:00:00.000000', '22:00:00.000000', '9833027707', 'support.jamnagar@tatapower.com', 'Cafeteria, Restroom, Wi-Fi', 4.6, 'OPEN', '2026-07-28 10:08:28.260875', 3),
(67, 'Torrent Power Hub - Jamnagar Ring Road #2', 'Plot 325, Ring Road, Jamnagar, Gujarat', 'Jamnagar', 'Gujarat', '361065', 22.44235040, 70.03173410, '08:00:00.000000', '23:59:00.000000', '9821385825', 'support.jamnagar@torrentpower.com', 'Restroom, Convenience Store', 4.6, 'OPEN', '2026-07-28 10:08:28.275248', 5),
(68, 'Torrent Power Hub - Jamnagar Link Road #3', 'Plot 260, Link Road, Jamnagar, Gujarat', 'Jamnagar', 'Gujarat', '361046', 22.49884570, 70.09174890, '06:00:00.000000', '23:00:00.000000', '9870434999', 'support.jamnagar@torrentpower.com', 'Restroom, Supermarket Proximity', 4.2, 'OPEN', '2026-07-28 10:08:28.299330', 5),
(69, 'Adani Gas EV Hub - Jamnagar VIP Road #4', 'Plot 378, VIP Road, Jamnagar, Gujarat', 'Jamnagar', 'Gujarat', '361051', 22.50055090, 70.04391620, '08:00:00.000000', '22:00:00.000000', '9866794624', 'support.jamnagar@adanigasev.com', 'Restroom, Convenience Store', 4.2, 'OPEN', '2026-07-28 10:08:28.325389', 5),
(70, 'Tata Power Hub - Jamnagar VIP Road #5', 'Plot 365, VIP Road, Jamnagar, Gujarat', 'Jamnagar', 'Gujarat', '361023', 22.48014930, 70.05050330, '06:00:00.000000', '23:00:00.000000', '9851210400', 'support.jamnagar@tatapower.com', 'Restroom, Coffee Shop', 4.4, 'OPEN', '2026-07-28 10:08:28.341798', 3),
(71, 'Tata Power Hub - Jamnagar Main Road #6', 'Plot 319, Main Road, Jamnagar, Gujarat', 'Jamnagar', 'Gujarat', '361088', 22.44699430, 70.08985170, '06:00:00.000000', '23:00:00.000000', '9867408729', 'support.jamnagar@tatapower.com', 'Restroom, Food Court Proximity', 4.9, 'OPEN', '2026-07-28 10:08:28.371104', 3),
(72, 'Jio-bp Pulse Hub - Jamnagar Main Road #7', 'Plot 142, Main Road, Jamnagar, Gujarat', 'Jamnagar', 'Gujarat', '361063', 22.49269450, 70.07204200, '06:00:00.000000', '22:00:00.000000', '9899957354', 'support.jamnagar@jiobppulse.com', 'Food Stall, Restroom', 4.7, 'OPEN', '2026-07-28 10:08:28.399446', 3),
(73, 'Tata Power Hub - Jamnagar Ring Road #8', 'Plot 260, Ring Road, Jamnagar, Gujarat', 'Jamnagar', 'Gujarat', '361017', 22.50015460, 70.09035720, '00:00:00.000000', '22:00:00.000000', '9817619190', 'support.jamnagar@tatapower.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 4.4, 'OPEN', '2026-07-28 10:08:28.420806', 3),
(74, 'Tata Power Hub - Jamnagar City Center Road #9', 'Plot 72, City Center Road, Jamnagar, Gujarat', 'Jamnagar', 'Gujarat', '361040', 22.48602530, 70.08098920, '08:00:00.000000', '23:59:00.000000', '9838658976', 'support.jamnagar@tatapower.com', 'Restroom, Coffee Shop', 4.3, 'OPEN', '2026-07-28 10:08:28.439358', 3),
(75, 'Tata Power Hub - Jamnagar Airport Road #10', 'Plot 180, Airport Road, Jamnagar, Gujarat', 'Jamnagar', 'Gujarat', '361059', 22.46182730, 70.03996620, '08:00:00.000000', '22:59:00.000000', '9884711711', 'support.jamnagar@tatapower.com', 'Cafeteria, Restroom, Wi-Fi', 4.9, 'OPEN', '2026-07-28 10:08:28.457291', 3),
(76, 'Adani Gas EV Hub - Junagadh Industrial Area Road #1', 'Plot 108, Industrial Area Road, Junagadh, Gujarat', 'Junagadh', 'Gujarat', '362065', 21.53947060, 70.44578260, '00:00:00.000000', '23:00:00.000000', '9865957319', 'support.junagadh@adanigasev.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 4.6, 'OPEN', '2026-07-28 10:08:28.474761', 5),
(77, 'Jio-bp Pulse Hub - Junagadh Highway 48 Bypass #2', 'Plot 203, Highway 48 Bypass, Junagadh, Gujarat', 'Junagadh', 'Gujarat', '362091', 21.50063240, 70.42608170, '08:00:00.000000', '22:59:00.000000', '9850105697', 'support.junagadh@jiobppulse.com', 'Cafeteria, Restroom, Wi-Fi', 4.4, 'OPEN', '2026-07-28 10:08:28.488511', 3),
(78, 'Torrent Power Hub - Junagadh Ring Road #3', 'Plot 159, Ring Road, Junagadh, Gujarat', 'Junagadh', 'Gujarat', '362023', 21.52884740, 70.48793320, '00:00:00.000000', '22:00:00.000000', '9823719474', 'support.junagadh@torrentpower.com', 'Restroom, Convenience Store', 4.4, 'OPEN', '2026-07-28 10:08:28.501767', 5),
(79, 'Tata Power Hub - Junagadh City Center Road #4', 'Plot 328, City Center Road, Junagadh, Gujarat', 'Junagadh', 'Gujarat', '362059', 21.55584100, 70.42696120, '08:00:00.000000', '23:59:00.000000', '9883579398', 'support.junagadh@tatapower.com', 'Food Stall, Restroom', 4.5, 'OPEN', '2026-07-28 10:08:28.525529', 3),
(80, 'Tata Power Hub - Junagadh Ring Road #5', 'Plot 432, Ring Road, Junagadh, Gujarat', 'Junagadh', 'Gujarat', '362036', 21.49643250, 70.46706850, '08:00:00.000000', '22:59:00.000000', '9879077464', 'support.junagadh@tatapower.com', 'Restroom, Coffee Shop', 4.7, 'OPEN', '2026-07-28 10:08:28.547545', 3),
(81, 'Jio-bp Pulse Hub - Junagadh Industrial Area Road #6', 'Plot 259, Industrial Area Road, Junagadh, Gujarat', 'Junagadh', 'Gujarat', '362013', 21.55103290, 70.43212620, '00:00:00.000000', '22:59:00.000000', '9872749772', 'support.junagadh@jiobppulse.com', 'Restroom, Shopping Mall Proximity', 4.4, 'OPEN', '2026-07-28 10:08:28.570295', 3),
(82, 'Adani Gas EV Hub - Junagadh Market Street #7', 'Plot 421, Market Street, Junagadh, Gujarat', 'Junagadh', 'Gujarat', '362070', 21.54326740, 70.45580290, '08:00:00.000000', '23:00:00.000000', '9838036284', 'support.junagadh@adanigasev.com', 'Restroom, Shopping Mall Proximity', 4.5, 'OPEN', '2026-07-28 10:08:28.598913', 5),
(83, 'Zeon Charging Hub - Junagadh GIDC Sector 2 #8', 'Plot 242, GIDC Sector 2, Junagadh, Gujarat', 'Junagadh', 'Gujarat', '362065', 21.49843970, 70.47480350, '06:00:00.000000', '22:59:00.000000', '9886434411', 'support.junagadh@zeoncharging.com', 'Restroom, Convenience Store', 4.4, 'OPEN', '2026-07-28 10:08:28.612889', 3),
(84, 'Jio-bp Pulse Hub - Junagadh Highway 48 Bypass #9', 'Plot 40, Highway 48 Bypass, Junagadh, Gujarat', 'Junagadh', 'Gujarat', '362095', 21.52902270, 70.49177570, '06:00:00.000000', '22:00:00.000000', '9899252880', 'support.junagadh@jiobppulse.com', 'Restroom, Food Court Proximity', 4.8, 'OPEN', '2026-07-28 10:08:28.642798', 3),
(85, 'Zeon Charging Hub - Junagadh VIP Road #10', 'Plot 255, VIP Road, Junagadh, Gujarat', 'Junagadh', 'Gujarat', '362014', 21.49451450, 70.44875590, '08:00:00.000000', '23:00:00.000000', '9898220131', 'support.junagadh@zeoncharging.com', 'Food Stall, Restroom', 4.7, 'OPEN', '2026-07-28 10:08:28.657681', 3),
(86, 'Jio-bp Pulse Hub - Anand Market Street #1', 'Plot 268, Market Street, Anand, Gujarat', 'Anand', 'Gujarat', '388020', 22.58855170, 72.94796490, '08:00:00.000000', '22:00:00.000000', '9812624364', 'support.anand@jiobppulse.com', 'Restroom, Convenience Store', 4.9, 'OPEN', '2026-07-28 10:08:28.680357', 3),
(87, 'Torrent Power Hub - Anand Market Street #2', 'Plot 452, Market Street, Anand, Gujarat', 'Anand', 'Gujarat', '388019', 22.59400210, 72.88922450, '06:00:00.000000', '23:00:00.000000', '9813049906', 'support.anand@torrentpower.com', 'Restroom, Supermarket Proximity', 4.7, 'OPEN', '2026-07-28 10:08:28.707612', 5),
(88, 'Zeon Charging Hub - Anand Main Road #3', 'Plot 320, Main Road, Anand, Gujarat', 'Anand', 'Gujarat', '388030', 22.59945280, 72.90608900, '00:00:00.000000', '23:00:00.000000', '9854724524', 'support.anand@zeoncharging.com', 'Restroom, Food Court Proximity', 4.8, 'OPEN', '2026-07-28 10:08:28.734263', 3),
(89, 'Zeon Charging Hub - Anand Station Road #4', 'Plot 472, Station Road, Anand, Gujarat', 'Anand', 'Gujarat', '388048', 22.57617620, 72.91301920, '06:00:00.000000', '23:59:00.000000', '9877685458', 'support.anand@zeoncharging.com', 'Cafeteria, Restroom, Wi-Fi', 4.0, 'OPEN', '2026-07-28 10:08:28.754394', 3),
(90, 'Tata Power Hub - Anand Link Road #5', 'Plot 484, Link Road, Anand, Gujarat', 'Anand', 'Gujarat', '388012', 22.59286890, 72.93251830, '08:00:00.000000', '23:00:00.000000', '9872167368', 'support.anand@tatapower.com', 'Restroom, Shopping Mall Proximity', 4.0, 'OPEN', '2026-07-28 10:08:28.769494', 3),
(91, 'Zeon Charging Hub - Anand College Road #6', 'Plot 21, College Road, Anand, Gujarat', 'Anand', 'Gujarat', '388030', 22.56505820, 72.94525460, '08:00:00.000000', '23:59:00.000000', '9865922215', 'support.anand@zeoncharging.com', 'Restroom, Supermarket Proximity', 4.0, 'OPEN', '2026-07-28 10:08:28.789081', 3),
(92, 'Tata Power Hub - Anand Market Street #7', 'Plot 370, Market Street, Anand, Gujarat', 'Anand', 'Gujarat', '388061', 22.54351220, 72.95420930, '00:00:00.000000', '23:00:00.000000', '9893330837', 'support.anand@tatapower.com', 'Cafeteria, Restroom, Wi-Fi', 4.4, 'OPEN', '2026-07-28 10:08:28.813790', 3),
(93, 'Zeon Charging Hub - Anand College Road #8', 'Plot 432, College Road, Anand, Gujarat', 'Anand', 'Gujarat', '388097', 22.55706580, 72.89401330, '00:00:00.000000', '23:59:00.000000', '9815840821', 'support.anand@zeoncharging.com', 'Restroom, Shopping Mall Proximity', 4.5, 'OPEN', '2026-07-28 10:08:28.828480', 3),
(94, 'Adani Gas EV Hub - Anand Industrial Area Road #9', 'Plot 254, Industrial Area Road, Anand, Gujarat', 'Anand', 'Gujarat', '388050', 22.56671950, 72.91124110, '08:00:00.000000', '23:59:00.000000', '9888256365', 'support.anand@adanigasev.com', 'Restroom, Shopping Mall Proximity', 4.0, 'OPEN', '2026-07-28 10:08:28.841694', 5),
(95, 'Adani Gas EV Hub - Anand Main Road #10', 'Plot 469, Main Road, Anand, Gujarat', 'Anand', 'Gujarat', '388082', 22.54434730, 72.89255360, '08:00:00.000000', '23:59:00.000000', '9812621013', 'support.anand@adanigasev.com', 'Restroom, Convenience Store', 4.7, 'OPEN', '2026-07-28 10:08:28.854571', 5),
(96, 'Tata Power Hub - Mehsana Station Road #1', 'Plot 145, Station Road, Mehsana, Gujarat', 'Mehsana', 'Gujarat', '384064', 23.56010310, 72.33483340, '06:00:00.000000', '23:59:00.000000', '9818214250', 'support.mehsana@tatapower.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 4.1, 'OPEN', '2026-07-28 10:08:28.867544', 3),
(97, 'Tata Power Hub - Mehsana GIDC Sector 2 #2', 'Plot 60, GIDC Sector 2, Mehsana, Gujarat', 'Mehsana', 'Gujarat', '384073', 23.58908030, 72.35839390, '06:00:00.000000', '22:00:00.000000', '9894872269', 'support.mehsana@tatapower.com', 'Food Stall, Restroom', 3.8, 'OPEN', '2026-07-28 10:08:28.880954', 3),
(98, 'Torrent Power Hub - Mehsana Airport Road #3', 'Plot 368, Airport Road, Mehsana, Gujarat', 'Mehsana', 'Gujarat', '384052', 23.58881780, 72.36672110, '06:00:00.000000', '23:59:00.000000', '9878873977', 'support.mehsana@torrentpower.com', 'Restroom, Shopping Mall Proximity', 4.7, 'OPEN', '2026-07-28 10:08:28.898913', 5),
(99, 'Zeon Charging Hub - Mehsana Airport Road #4', 'Plot 420, Airport Road, Mehsana, Gujarat', 'Mehsana', 'Gujarat', '384015', 23.58581010, 72.38417300, '06:00:00.000000', '23:00:00.000000', '9870704730', 'support.mehsana@zeoncharging.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 4.2, 'OPEN', '2026-07-28 10:08:28.912987', 3),
(100, 'Adani Gas EV Hub - Mehsana Industrial Area Road #5', 'Plot 473, Industrial Area Road, Mehsana, Gujarat', 'Mehsana', 'Gujarat', '384049', 23.59759980, 72.38936610, '06:00:00.000000', '23:59:00.000000', '9866128412', 'support.mehsana@adanigasev.com', 'Restroom, Food Court Proximity', 4.4, 'OPEN', '2026-07-28 10:08:28.926841', 5),
(101, 'Zeon Charging Hub - Mehsana Ring Road #6', 'Plot 239, Ring Road, Mehsana, Gujarat', 'Mehsana', 'Gujarat', '384062', 23.60753420, 72.34811160, '06:00:00.000000', '22:59:00.000000', '9894543114', 'support.mehsana@zeoncharging.com', 'Food Stall, Restroom', 3.9, 'OPEN', '2026-07-28 10:08:28.949675', 3),
(102, 'Torrent Power Hub - Mehsana Link Road #7', 'Plot 83, Link Road, Mehsana, Gujarat', 'Mehsana', 'Gujarat', '384092', 23.59514420, 72.39918840, '08:00:00.000000', '22:00:00.000000', '9869547350', 'support.mehsana@torrentpower.com', 'Restroom, Coffee Shop', 3.8, 'OPEN', '2026-07-28 10:08:28.976445', 5),
(103, 'Zeon Charging Hub - Mehsana Industrial Area Road #8', 'Plot 317, Industrial Area Road, Mehsana, Gujarat', 'Mehsana', 'Gujarat', '384034', 23.56230630, 72.40728950, '08:00:00.000000', '23:00:00.000000', '9818162967', 'support.mehsana@zeoncharging.com', 'Restroom, Shopping Mall Proximity', 3.9, 'OPEN', '2026-07-28 10:08:28.998904', 3),
(104, 'Tata Power Hub - Mehsana Ring Road #9', 'Plot 428, Ring Road, Mehsana, Gujarat', 'Mehsana', 'Gujarat', '384052', 23.55291720, 72.36672770, '08:00:00.000000', '23:00:00.000000', '9859394713', 'support.mehsana@tatapower.com', 'Restroom, Coffee Shop', 4.5, 'OPEN', '2026-07-28 10:08:29.023669', 3),
(105, 'Jio-bp Pulse Hub - Mehsana Ring Road #10', 'Plot 351, Ring Road, Mehsana, Gujarat', 'Mehsana', 'Gujarat', '384010', 23.61243470, 72.34582430, '08:00:00.000000', '23:00:00.000000', '9874570985', 'support.mehsana@jiobppulse.com', 'Restroom, Convenience Store', 4.4, 'OPEN', '2026-07-28 10:08:29.042455', 3),
(106, 'Adani Gas EV Hub - Morbi Market Street #1', 'Plot 88, Market Street, Morbi, Gujarat', 'Morbi', 'Gujarat', '363620', 22.81752850, 70.83305780, '08:00:00.000000', '23:00:00.000000', '9841351254', 'support.morbi@adanigasev.com', 'Cafeteria, Restroom, Wi-Fi', 4.8, 'OPEN', '2026-07-28 10:08:29.065565', 5),
(107, 'Tata Power Hub - Morbi Main Road #2', 'Plot 327, Main Road, Morbi, Gujarat', 'Morbi', 'Gujarat', '363631', 22.80177920, 70.80945310, '06:00:00.000000', '23:59:00.000000', '9824273070', 'support.morbi@tatapower.com', 'Restroom, Convenience Store', 4.1, 'OPEN', '2026-07-28 10:08:29.094800', 3),
(108, 'Torrent Power Hub - Morbi Industrial Area Road #3', 'Plot 92, Industrial Area Road, Morbi, Gujarat', 'Morbi', 'Gujarat', '363620', 22.83649530, 70.84484570, '06:00:00.000000', '22:59:00.000000', '9891624263', 'support.morbi@torrentpower.com', 'Restroom, Shopping Mall Proximity', 4.4, 'OPEN', '2026-07-28 10:08:29.120806', 5),
(109, 'Torrent Power Hub - Morbi Airport Road #4', 'Plot 276, Airport Road, Morbi, Gujarat', 'Morbi', 'Gujarat', '363655', 22.83190290, 70.83688640, '06:00:00.000000', '22:00:00.000000', '9896984688', 'support.morbi@torrentpower.com', 'Cafeteria, Restroom, Wi-Fi', 4.5, 'OPEN', '2026-07-28 10:08:29.133799', 5),
(110, 'Tata Power Hub - Morbi Main Road #5', 'Plot 314, Main Road, Morbi, Gujarat', 'Morbi', 'Gujarat', '363641', 22.84954950, 70.82423600, '00:00:00.000000', '23:00:00.000000', '9839359297', 'support.morbi@tatapower.com', 'Restroom, Shopping Mall Proximity', 4.4, 'OPEN', '2026-07-28 10:08:29.161104', 3),
(111, 'Jio-bp Pulse Hub - Morbi Market Street #6', 'Plot 447, Market Street, Morbi, Gujarat', 'Morbi', 'Gujarat', '363678', 22.77637710, 70.85236390, '00:00:00.000000', '23:00:00.000000', '9817316664', 'support.morbi@jiobppulse.com', 'Restroom, Coffee Shop', 4.5, 'OPEN', '2026-07-28 10:08:29.179269', 3),
(112, 'Adani Gas EV Hub - Morbi Highway 48 Bypass #7', 'Plot 384, Highway 48 Bypass, Morbi, Gujarat', 'Morbi', 'Gujarat', '363650', 22.80200060, 70.85177090, '08:00:00.000000', '22:00:00.000000', '9810814137', 'support.morbi@adanigasev.com', 'Food Stall, Restroom', 4.2, 'OPEN', '2026-07-28 10:08:29.196654', 5),
(113, 'Torrent Power Hub - Morbi College Road #8', 'Plot 387, College Road, Morbi, Gujarat', 'Morbi', 'Gujarat', '363650', 22.83942680, 70.80498060, '06:00:00.000000', '23:59:00.000000', '9862285332', 'support.morbi@torrentpower.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 4.2, 'OPEN', '2026-07-28 10:08:29.225027', 5),
(114, 'Torrent Power Hub - Morbi Ring Road #9', 'Plot 134, Ring Road, Morbi, Gujarat', 'Morbi', 'Gujarat', '363617', 22.81817220, 70.84788560, '08:00:00.000000', '23:00:00.000000', '9873016370', 'support.morbi@torrentpower.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 4.9, 'OPEN', '2026-07-28 10:08:29.247861', 5),
(115, 'Jio-bp Pulse Hub - Morbi Market Street #10', 'Plot 71, Market Street, Morbi, Gujarat', 'Morbi', 'Gujarat', '363667', 22.80956080, 70.84028260, '08:00:00.000000', '22:59:00.000000', '9831683207', 'support.morbi@jiobppulse.com', 'Restroom, Convenience Store', 4.0, 'OPEN', '2026-07-28 10:08:29.261569', 3),
(116, 'Zeon Charging Hub - Bharuch Airport Road #1', 'Plot 133, Airport Road, Bharuch, Gujarat', 'Bharuch', 'Gujarat', '392058', 21.70822050, 73.00026590, '00:00:00.000000', '22:59:00.000000', '9819731945', 'support.bharuch@zeoncharging.com', 'Cafeteria, Restroom, Wi-Fi', 4.0, 'OPEN', '2026-07-28 10:08:29.284704', 3),
(117, 'Tata Power Hub - Bharuch Ring Road #2', 'Plot 181, Ring Road, Bharuch, Gujarat', 'Bharuch', 'Gujarat', '392043', 21.70219670, 72.96667240, '06:00:00.000000', '23:59:00.000000', '9825372819', 'support.bharuch@tatapower.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 3.9, 'OPEN', '2026-07-28 10:08:29.324283', 3),
(118, 'Torrent Power Hub - Bharuch GIDC Sector 2 #3', 'Plot 161, GIDC Sector 2, Bharuch, Gujarat', 'Bharuch', 'Gujarat', '392051', 21.70176980, 73.02817250, '06:00:00.000000', '22:59:00.000000', '9860047877', 'support.bharuch@torrentpower.com', 'Restroom, Coffee Shop', 4.3, 'OPEN', '2026-07-28 10:08:29.345097', 5),
(119, 'Tata Power Hub - Bharuch Industrial Area Road #4', 'Plot 198, Industrial Area Road, Bharuch, Gujarat', 'Bharuch', 'Gujarat', '392017', 21.70076180, 73.03258430, '00:00:00.000000', '23:59:00.000000', '9895541219', 'support.bharuch@tatapower.com', 'Cafeteria, Restroom, Wi-Fi', 3.9, 'OPEN', '2026-07-28 10:08:29.367235', 3),
(120, 'Tata Power Hub - Bharuch GIDC Sector 2 #5', 'Plot 452, GIDC Sector 2, Bharuch, Gujarat', 'Bharuch', 'Gujarat', '392030', 21.73916080, 73.02837110, '00:00:00.000000', '23:59:00.000000', '9884425998', 'support.bharuch@tatapower.com', 'Restroom, Supermarket Proximity', 3.9, 'OPEN', '2026-07-28 10:08:29.381057', 3),
(121, 'Torrent Power Hub - Bharuch Industrial Area Road #6', 'Plot 487, Industrial Area Road, Bharuch, Gujarat', 'Bharuch', 'Gujarat', '392050', 21.71296020, 72.95799840, '00:00:00.000000', '22:59:00.000000', '9822187575', 'support.bharuch@torrentpower.com', 'Restroom, Coffee Shop', 4.3, 'OPEN', '2026-07-28 10:08:29.398105', 5),
(122, 'Torrent Power Hub - Bharuch City Center Road #7', 'Plot 265, City Center Road, Bharuch, Gujarat', 'Bharuch', 'Gujarat', '392013', 21.73676950, 73.03534430, '00:00:00.000000', '23:00:00.000000', '9873895405', 'support.bharuch@torrentpower.com', 'Restroom, Food Court Proximity', 4.2, 'OPEN', '2026-07-28 10:08:29.420284', 5),
(123, 'Zeon Charging Hub - Bharuch Airport Road #8', 'Plot 350, Airport Road, Bharuch, Gujarat', 'Bharuch', 'Gujarat', '392081', 21.74382530, 72.97278270, '08:00:00.000000', '23:00:00.000000', '9833766195', 'support.bharuch@zeoncharging.com', 'Cafeteria, Restroom, Wi-Fi', 4.0, 'OPEN', '2026-07-28 10:08:29.433223', 3),
(124, 'Torrent Power Hub - Bharuch GIDC Sector 2 #9', 'Plot 116, GIDC Sector 2, Bharuch, Gujarat', 'Bharuch', 'Gujarat', '392050', 21.72524480, 73.02199390, '00:00:00.000000', '23:00:00.000000', '9885786384', 'support.bharuch@torrentpower.com', 'Restroom, Coffee Shop', 4.2, 'OPEN', '2026-07-28 10:08:29.455922', 5),
(125, 'Tata Power Hub - Bharuch Main Road #10', 'Plot 410, Main Road, Bharuch, Gujarat', 'Bharuch', 'Gujarat', '392022', 21.74036820, 72.96992400, '00:00:00.000000', '22:59:00.000000', '9850809513', 'support.bharuch@tatapower.com', 'Restroom, Coffee Shop', 4.1, 'OPEN', '2026-07-28 10:08:29.476331', 3),
(126, 'Torrent Power Hub - Navsari VIP Road #1', 'Plot 22, VIP Road, Navsari, Gujarat', 'Navsari', 'Gujarat', '396458', 20.93334930, 72.95297460, '06:00:00.000000', '23:00:00.000000', '9844874058', 'support.navsari@torrentpower.com', 'Cafeteria, Restroom, Wi-Fi', 3.9, 'OPEN', '2026-07-28 10:08:29.492864', 5),
(127, 'Adani Gas EV Hub - Navsari VIP Road #2', 'Plot 370, VIP Road, Navsari, Gujarat', 'Navsari', 'Gujarat', '396468', 20.96159180, 72.93551920, '06:00:00.000000', '23:00:00.000000', '9823231162', 'support.navsari@adanigasev.com', 'Restroom, Shopping Mall Proximity', 4.6, 'OPEN', '2026-07-28 10:08:29.512219', 5),
(128, 'Tata Power Hub - Navsari GIDC Sector 2 #3', 'Plot 259, GIDC Sector 2, Navsari, Gujarat', 'Navsari', 'Gujarat', '396458', 20.91888510, 72.91223450, '08:00:00.000000', '22:00:00.000000', '9861404348', 'support.navsari@tatapower.com', 'Restroom, Coffee Shop', 4.6, 'OPEN', '2026-07-28 10:08:29.526666', 3),
(129, 'Adani Gas EV Hub - Navsari Ring Road #4', 'Plot 374, Ring Road, Navsari, Gujarat', 'Navsari', 'Gujarat', '396451', 20.96145180, 72.92636890, '00:00:00.000000', '23:59:00.000000', '9846122914', 'support.navsari@adanigasev.com', 'Restroom, Convenience Store', 3.9, 'OPEN', '2026-07-28 10:08:29.553999', 5),
(130, 'Torrent Power Hub - Navsari Main Road #5', 'Plot 464, Main Road, Navsari, Gujarat', 'Navsari', 'Gujarat', '396498', 20.98541350, 72.91345150, '06:00:00.000000', '22:59:00.000000', '9888707467', 'support.navsari@torrentpower.com', 'Restroom, Coffee Shop', 4.7, 'OPEN', '2026-07-28 10:08:29.567662', 5),
(131, 'Adani Gas EV Hub - Navsari Station Road #6', 'Plot 262, Station Road, Navsari, Gujarat', 'Navsari', 'Gujarat', '396412', 20.94502810, 72.93408780, '06:00:00.000000', '23:59:00.000000', '9857019790', 'support.navsari@adanigasev.com', 'Restroom, Shopping Mall Proximity', 4.8, 'OPEN', '2026-07-28 10:08:29.581914', 5),
(132, 'Jio-bp Pulse Hub - Navsari Station Road #7', 'Plot 69, Station Road, Navsari, Gujarat', 'Navsari', 'Gujarat', '396498', 20.92729330, 72.95708420, '08:00:00.000000', '22:00:00.000000', '9857946659', 'support.navsari@jiobppulse.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 4.5, 'OPEN', '2026-07-28 10:08:29.598806', 3),
(133, 'Tata Power Hub - Navsari Link Road #8', 'Plot 219, Link Road, Navsari, Gujarat', 'Navsari', 'Gujarat', '396485', 20.93512160, 72.97020290, '00:00:00.000000', '22:00:00.000000', '9887070951', 'support.navsari@tatapower.com', 'Restroom, Coffee Shop', 4.2, 'OPEN', '2026-07-28 10:08:29.625271', 3),
(134, 'Jio-bp Pulse Hub - Navsari Airport Road #9', 'Plot 35, Airport Road, Navsari, Gujarat', 'Navsari', 'Gujarat', '396466', 20.90796920, 72.96312200, '06:00:00.000000', '22:59:00.000000', '9862989921', 'support.navsari@jiobppulse.com', 'Food Stall, Restroom', 4.0, 'OPEN', '2026-07-28 10:08:29.647000', 3),
(135, 'Adani Gas EV Hub - Navsari Station Road #10', 'Plot 24, Station Road, Navsari, Gujarat', 'Navsari', 'Gujarat', '396454', 20.92901520, 72.97182990, '00:00:00.000000', '22:00:00.000000', '9858929604', 'support.navsari@adanigasev.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 3.9, 'OPEN', '2026-07-28 10:08:29.665611', 5),
(136, 'Tata Power Hub - Valsad Ring Road #1', 'Plot 166, Ring Road, Valsad, Gujarat', 'Valsad', 'Gujarat', '396073', 20.57290800, 72.91063880, '06:00:00.000000', '22:00:00.000000', '9837610501', 'support.valsad@tatapower.com', 'Restroom, Shopping Mall Proximity', 4.5, 'OPEN', '2026-07-28 10:08:29.692846', 3),
(137, 'Jio-bp Pulse Hub - Valsad Main Road #2', 'Plot 240, Main Road, Valsad, Gujarat', 'Valsad', 'Gujarat', '396076', 20.63744020, 72.97284910, '08:00:00.000000', '22:59:00.000000', '9890734121', 'support.valsad@jiobppulse.com', 'Restroom, Supermarket Proximity', 3.9, 'OPEN', '2026-07-28 10:08:29.720423', 3),
(138, 'Zeon Charging Hub - Valsad City Center Road #3', 'Plot 474, City Center Road, Valsad, Gujarat', 'Valsad', 'Gujarat', '396026', 20.60604420, 72.89795580, '00:00:00.000000', '22:59:00.000000', '9814846503', 'support.valsad@zeoncharging.com', 'Cafeteria, Restroom, Wi-Fi', 4.2, 'OPEN', '2026-07-28 10:08:29.735459', 3),
(139, 'Adani Gas EV Hub - Valsad VIP Road #4', 'Plot 450, VIP Road, Valsad, Gujarat', 'Valsad', 'Gujarat', '396078', 20.63496410, 72.97398830, '00:00:00.000000', '22:00:00.000000', '9831596300', 'support.valsad@adanigasev.com', 'Restroom, Supermarket Proximity', 4.6, 'OPEN', '2026-07-28 10:08:29.764260', 5),
(140, 'Torrent Power Hub - Valsad College Road #5', 'Plot 20, College Road, Valsad, Gujarat', 'Valsad', 'Gujarat', '396096', 20.61014790, 72.90337930, '00:00:00.000000', '22:59:00.000000', '9816360426', 'support.valsad@torrentpower.com', 'Restroom, Convenience Store', 4.1, 'OPEN', '2026-07-28 10:08:29.788693', 5),
(141, 'Zeon Charging Hub - Valsad Airport Road #6', 'Plot 50, Airport Road, Valsad, Gujarat', 'Valsad', 'Gujarat', '396081', 20.63154150, 72.96841120, '06:00:00.000000', '23:59:00.000000', '9852184953', 'support.valsad@zeoncharging.com', 'Cafeteria, Restroom, Wi-Fi', 4.6, 'OPEN', '2026-07-28 10:08:29.809131', 3),
(142, 'Jio-bp Pulse Hub - Valsad Ring Road #7', 'Plot 239, Ring Road, Valsad, Gujarat', 'Valsad', 'Gujarat', '396065', 20.61578440, 72.97070980, '00:00:00.000000', '22:59:00.000000', '9848211896', 'support.valsad@jiobppulse.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 4.2, 'OPEN', '2026-07-28 10:08:29.838851', 3),
(143, 'Tata Power Hub - Valsad Main Road #8', 'Plot 183, Main Road, Valsad, Gujarat', 'Valsad', 'Gujarat', '396040', 20.59653370, 72.90776170, '06:00:00.000000', '23:59:00.000000', '9828353803', 'support.valsad@tatapower.com', 'Restroom, Shopping Mall Proximity', 4.7, 'OPEN', '2026-07-28 10:08:29.857546', 3),
(144, 'Zeon Charging Hub - Valsad Industrial Area Road #9', 'Plot 65, Industrial Area Road, Valsad, Gujarat', 'Valsad', 'Gujarat', '396031', 20.56773090, 72.93509230, '00:00:00.000000', '22:59:00.000000', '9853199374', 'support.valsad@zeoncharging.com', 'Restroom, Shopping Mall Proximity', 4.6, 'OPEN', '2026-07-28 10:08:29.880627', 3),
(145, 'Adani Gas EV Hub - Valsad VIP Road #10', 'Plot 465, VIP Road, Valsad, Gujarat', 'Valsad', 'Gujarat', '396086', 20.57011750, 72.96089850, '00:00:00.000000', '23:00:00.000000', '9847546365', 'support.valsad@adanigasev.com', 'Restroom, Coffee Shop', 4.0, 'OPEN', '2026-07-28 10:08:29.900199', 5),
(146, 'Zeon Charging Hub - Vapi GIDC Sector 2 #1', 'Plot 415, GIDC Sector 2, Vapi, Gujarat', 'Vapi', 'Gujarat', '396161', 20.36639400, 72.89978690, '08:00:00.000000', '22:00:00.000000', '9884201344', 'support.vapi@zeoncharging.com', 'Restroom, Convenience Store', 4.8, 'OPEN', '2026-07-28 10:08:29.929606', 3),
(147, 'Torrent Power Hub - Vapi Link Road #2', 'Plot 309, Link Road, Vapi, Gujarat', 'Vapi', 'Gujarat', '396127', 20.36200110, 72.94054680, '08:00:00.000000', '22:59:00.000000', '9867344070', 'support.vapi@torrentpower.com', 'Restroom, Coffee Shop', 3.9, 'OPEN', '2026-07-28 10:08:29.943209', 5),
(148, 'Tata Power Hub - Vapi Main Road #3', 'Plot 414, Main Road, Vapi, Gujarat', 'Vapi', 'Gujarat', '396152', 20.35305300, 72.86870680, '00:00:00.000000', '23:59:00.000000', '9827369683', 'support.vapi@tatapower.com', 'Restroom, Convenience Store', 4.5, 'OPEN', '2026-07-28 10:08:29.958251', 3),
(149, 'Zeon Charging Hub - Vapi City Center Road #4', 'Plot 238, City Center Road, Vapi, Gujarat', 'Vapi', 'Gujarat', '396180', 20.34043600, 72.89284100, '00:00:00.000000', '23:59:00.000000', '9845708159', 'support.vapi@zeoncharging.com', 'Cafeteria, Restroom, Wi-Fi', 4.1, 'OPEN', '2026-07-28 10:08:29.985853', 3),
(150, 'Adani Gas EV Hub - Vapi Main Road #5', 'Plot 458, Main Road, Vapi, Gujarat', 'Vapi', 'Gujarat', '396125', 20.38141950, 72.89890690, '00:00:00.000000', '22:00:00.000000', '9876444144', 'support.vapi@adanigasev.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 4.3, 'OPEN', '2026-07-28 10:08:29.998962', 5),
(151, 'Zeon Charging Hub - Vapi Station Road #6', 'Plot 261, Station Road, Vapi, Gujarat', 'Vapi', 'Gujarat', '396180', 20.37819780, 72.92044230, '06:00:00.000000', '22:00:00.000000', '9816744249', 'support.vapi@zeoncharging.com', 'Food Stall, Restroom', 4.4, 'OPEN', '2026-07-28 10:08:30.017381', 3),
(152, 'Zeon Charging Hub - Vapi Airport Road #7', 'Plot 45, Airport Road, Vapi, Gujarat', 'Vapi', 'Gujarat', '396199', 20.34412190, 72.88602570, '06:00:00.000000', '22:00:00.000000', '9830615024', 'support.vapi@zeoncharging.com', 'Restroom, Supermarket Proximity', 4.3, 'OPEN', '2026-07-28 10:08:30.041643', 3),
(153, 'Jio-bp Pulse Hub - Vapi GIDC Sector 2 #8', 'Plot 480, GIDC Sector 2, Vapi, Gujarat', 'Vapi', 'Gujarat', '396114', 20.35164120, 72.86863750, '08:00:00.000000', '22:00:00.000000', '9893523786', 'support.vapi@jiobppulse.com', 'Restroom, Food Court Proximity', 4.4, 'OPEN', '2026-07-28 10:08:30.053604', 3),
(154, 'Tata Power Hub - Vapi VIP Road #9', 'Plot 459, VIP Road, Vapi, Gujarat', 'Vapi', 'Gujarat', '396197', 20.40914870, 72.88618400, '08:00:00.000000', '22:59:00.000000', '9865690005', 'support.vapi@tatapower.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 4.5, 'OPEN', '2026-07-28 10:08:30.070361', 3),
(155, 'Zeon Charging Hub - Vapi Airport Road #10', 'Plot 24, Airport Road, Vapi, Gujarat', 'Vapi', 'Gujarat', '396130', 20.33325420, 72.89180720, '06:00:00.000000', '22:00:00.000000', '9867184232', 'support.vapi@zeoncharging.com', 'Restroom, Shopping Mall Proximity', 4.4, 'OPEN', '2026-07-28 10:08:30.087206', 3),
(156, 'Tata Power Hub - Bhuj Highway 48 Bypass #1', 'Plot 360, Highway 48 Bypass, Bhuj, Gujarat', 'Bhuj', 'Gujarat', '370065', 23.25287820, 69.65922610, '08:00:00.000000', '22:00:00.000000', '9874271652', 'support.bhuj@tatapower.com', 'Restroom, Supermarket Proximity', 4.1, 'OPEN', '2026-07-28 10:08:30.105020', 3),
(157, 'Jio-bp Pulse Hub - Bhuj Industrial Area Road #2', 'Plot 324, Industrial Area Road, Bhuj, Gujarat', 'Bhuj', 'Gujarat', '370025', 23.25276550, 69.69459850, '06:00:00.000000', '23:59:00.000000', '9847908155', 'support.bhuj@jiobppulse.com', 'Restroom, Convenience Store', 4.2, 'OPEN', '2026-07-28 10:08:30.129611', 3);
INSERT INTO `stations_station` (`id`, `station_name`, `address`, `city`, `state`, `pincode`, `latitude`, `longitude`, `opening_time`, `closing_time`, `contact_number`, `email`, `amenities`, `rating`, `status`, `created_at`, `operator_id`) VALUES
(158, 'Zeon Charging Hub - Bhuj Station Road #3', 'Plot 59, Station Road, Bhuj, Gujarat', 'Bhuj', 'Gujarat', '370024', 23.22728330, 69.63858880, '06:00:00.000000', '22:00:00.000000', '9827698983', 'support.bhuj@zeoncharging.com', 'Restroom, Convenience Store', 4.7, 'OPEN', '2026-07-28 10:08:30.149472', 3),
(159, 'Tata Power Hub - Bhuj Airport Road #4', 'Plot 252, Airport Road, Bhuj, Gujarat', 'Bhuj', 'Gujarat', '370069', 23.22771220, 69.64890250, '08:00:00.000000', '23:00:00.000000', '9854542369', 'support.bhuj@tatapower.com', 'Restroom, Food Court Proximity', 4.3, 'OPEN', '2026-07-28 10:08:30.166371', 3),
(160, 'Tata Power Hub - Bhuj College Road #5', 'Plot 192, College Road, Bhuj, Gujarat', 'Bhuj', 'Gujarat', '370089', 23.27127570, 69.67506990, '08:00:00.000000', '22:59:00.000000', '9873656001', 'support.bhuj@tatapower.com', 'Cafeteria, Restroom, Wi-Fi', 3.8, 'OPEN', '2026-07-28 10:08:30.182897', 3),
(161, 'Adani Gas EV Hub - Bhuj Industrial Area Road #6', 'Plot 460, Industrial Area Road, Bhuj, Gujarat', 'Bhuj', 'Gujarat', '370065', 23.27856590, 69.67500800, '08:00:00.000000', '22:59:00.000000', '9865961795', 'support.bhuj@adanigasev.com', 'Food Stall, Restroom', 4.2, 'OPEN', '2026-07-28 10:08:30.203656', 5),
(162, 'Torrent Power Hub - Bhuj Market Street #7', 'Plot 15, Market Street, Bhuj, Gujarat', 'Bhuj', 'Gujarat', '370085', 23.22283670, 69.64757550, '08:00:00.000000', '22:00:00.000000', '9853798588', 'support.bhuj@torrentpower.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 4.0, 'OPEN', '2026-07-28 10:08:30.224293', 5),
(163, 'Jio-bp Pulse Hub - Bhuj City Center Road #8', 'Plot 89, City Center Road, Bhuj, Gujarat', 'Bhuj', 'Gujarat', '370085', 23.20696980, 69.63620710, '00:00:00.000000', '22:59:00.000000', '9819293083', 'support.bhuj@jiobppulse.com', 'Restroom, Shopping Mall Proximity', 4.6, 'OPEN', '2026-07-28 10:08:30.244420', 3),
(164, 'Tata Power Hub - Bhuj Ring Road #9', 'Plot 59, Ring Road, Bhuj, Gujarat', 'Bhuj', 'Gujarat', '370074', 23.23415810, 69.69358580, '00:00:00.000000', '23:59:00.000000', '9834293839', 'support.bhuj@tatapower.com', 'Restroom, Convenience Store', 4.0, 'OPEN', '2026-07-28 10:08:30.271188', 3),
(165, 'Tata Power Hub - Bhuj College Road #10', 'Plot 87, College Road, Bhuj, Gujarat', 'Bhuj', 'Gujarat', '370023', 23.27911490, 69.68106450, '00:00:00.000000', '23:00:00.000000', '9891575773', 'support.bhuj@tatapower.com', 'Restroom, Supermarket Proximity', 4.2, 'OPEN', '2026-07-28 10:08:30.288730', 3),
(166, 'Adani Gas EV Hub - Gandhidham Market Street #1', 'Plot 340, Market Street, Gandhidham, Gujarat', 'Gandhidham', 'Gujarat', '370244', 23.08609530, 70.14715140, '08:00:00.000000', '22:00:00.000000', '9813933292', 'support.gandhidham@adanigasev.com', 'Restroom, Supermarket Proximity', 3.9, 'OPEN', '2026-07-28 10:08:30.304793', 5),
(167, 'Jio-bp Pulse Hub - Gandhidham Link Road #2', 'Plot 254, Link Road, Gandhidham, Gujarat', 'Gandhidham', 'Gujarat', '370283', 23.10445330, 70.09110700, '00:00:00.000000', '22:00:00.000000', '9840867588', 'support.gandhidham@jiobppulse.com', 'Restroom, Supermarket Proximity', 4.6, 'OPEN', '2026-07-28 10:08:30.323562', 3),
(168, 'Tata Power Hub - Gandhidham Market Street #3', 'Plot 227, Market Street, Gandhidham, Gujarat', 'Gandhidham', 'Gujarat', '370274', 23.08401570, 70.15933850, '00:00:00.000000', '22:59:00.000000', '9848501972', 'support.gandhidham@tatapower.com', 'Cafeteria, Restroom, Wi-Fi', 4.1, 'OPEN', '2026-07-28 10:08:30.347192', 3),
(169, 'Adani Gas EV Hub - Gandhidham GIDC Sector 2 #4', 'Plot 136, GIDC Sector 2, Gandhidham, Gujarat', 'Gandhidham', 'Gujarat', '370260', 23.09479990, 70.16540210, '06:00:00.000000', '23:59:00.000000', '9883702100', 'support.gandhidham@adanigasev.com', 'Cafeteria, Restroom, Wi-Fi', 4.2, 'OPEN', '2026-07-28 10:08:30.366055', 5),
(170, 'Torrent Power Hub - Gandhidham Main Road #5', 'Plot 243, Main Road, Gandhidham, Gujarat', 'Gandhidham', 'Gujarat', '370254', 23.08846200, 70.13323570, '00:00:00.000000', '22:59:00.000000', '9823786975', 'support.gandhidham@torrentpower.com', 'Restroom, Convenience Store', 4.8, 'OPEN', '2026-07-28 10:08:30.390561', 5),
(171, 'Jio-bp Pulse Hub - Gandhidham Market Street #6', 'Plot 457, Market Street, Gandhidham, Gujarat', 'Gandhidham', 'Gujarat', '370222', 23.05494960, 70.11938610, '06:00:00.000000', '22:00:00.000000', '9868829462', 'support.gandhidham@jiobppulse.com', 'Restroom, Shopping Mall Proximity', 4.5, 'OPEN', '2026-07-28 10:08:30.409660', 3),
(172, 'Adani Gas EV Hub - Gandhidham Industrial Area Road #7', 'Plot 376, Industrial Area Road, Gandhidham, Gujarat', 'Gandhidham', 'Gujarat', '370218', 23.10821610, 70.13324550, '00:00:00.000000', '23:59:00.000000', '9884616678', 'support.gandhidham@adanigasev.com', 'Food Stall, Restroom', 3.9, 'OPEN', '2026-07-28 10:08:30.428753', 5),
(173, 'Tata Power Hub - Gandhidham Station Road #8', 'Plot 423, Station Road, Gandhidham, Gujarat', 'Gandhidham', 'Gujarat', '370276', 23.07190920, 70.12720700, '06:00:00.000000', '22:00:00.000000', '9827882574', 'support.gandhidham@tatapower.com', 'Restroom, Coffee Shop', 4.2, 'OPEN', '2026-07-28 10:08:30.447520', 3),
(174, 'Tata Power Hub - Gandhidham Airport Road #9', 'Plot 352, Airport Road, Gandhidham, Gujarat', 'Gandhidham', 'Gujarat', '370210', 23.07258500, 70.16353950, '00:00:00.000000', '23:59:00.000000', '9866916321', 'support.gandhidham@tatapower.com', 'Restroom, Food Court Proximity', 4.0, 'OPEN', '2026-07-28 10:08:30.466411', 3),
(175, 'Zeon Charging Hub - Gandhidham VIP Road #10', 'Plot 332, VIP Road, Gandhidham, Gujarat', 'Gandhidham', 'Gujarat', '370259', 23.07153030, 70.13587130, '00:00:00.000000', '22:59:00.000000', '9860949262', 'support.gandhidham@zeoncharging.com', 'Restroom, Coffee Shop', 4.7, 'OPEN', '2026-07-28 10:08:30.489134', 3),
(176, 'Jio-bp Pulse Hub - Porbandar Station Road #1', 'Plot 173, Station Road, Porbandar, Gujarat', 'Porbandar', 'Gujarat', '360568', 21.61174190, 69.63189310, '06:00:00.000000', '22:59:00.000000', '9850364193', 'support.porbandar@jiobppulse.com', 'Restroom, Supermarket Proximity', 4.8, 'OPEN', '2026-07-28 10:08:30.517567', 3),
(177, 'Torrent Power Hub - Porbandar Industrial Area Road #2', 'Plot 408, Industrial Area Road, Porbandar, Gujarat', 'Porbandar', 'Gujarat', '360598', 21.63195650, 69.61433000, '00:00:00.000000', '23:00:00.000000', '9839913053', 'support.porbandar@torrentpower.com', 'Restroom, Coffee Shop', 4.9, 'OPEN', '2026-07-28 10:08:30.540634', 5),
(178, 'Torrent Power Hub - Porbandar Airport Road #3', 'Plot 454, Airport Road, Porbandar, Gujarat', 'Porbandar', 'Gujarat', '360588', 21.61209460, 69.57820400, '08:00:00.000000', '22:00:00.000000', '9835708524', 'support.porbandar@torrentpower.com', 'Restroom, Convenience Store', 4.4, 'OPEN', '2026-07-28 10:08:30.554372', 5),
(179, 'Torrent Power Hub - Porbandar Link Road #4', 'Plot 24, Link Road, Porbandar, Gujarat', 'Porbandar', 'Gujarat', '360526', 21.67583300, 69.59169920, '08:00:00.000000', '23:59:00.000000', '9879111530', 'support.porbandar@torrentpower.com', 'Restroom, Convenience Store', 4.8, 'OPEN', '2026-07-28 10:08:30.567539', 5),
(180, 'Zeon Charging Hub - Porbandar Station Road #5', 'Plot 262, Station Road, Porbandar, Gujarat', 'Porbandar', 'Gujarat', '360558', 21.61728820, 69.62127470, '08:00:00.000000', '22:00:00.000000', '9853579919', 'support.porbandar@zeoncharging.com', 'Food Stall, Restroom', 4.7, 'OPEN', '2026-07-28 10:08:30.595029', 3),
(181, 'Jio-bp Pulse Hub - Porbandar VIP Road #6', 'Plot 61, VIP Road, Porbandar, Gujarat', 'Porbandar', 'Gujarat', '360595', 21.62754210, 69.63665010, '08:00:00.000000', '22:59:00.000000', '9849234760', 'support.porbandar@jiobppulse.com', 'Restroom, Supermarket Proximity', 3.9, 'OPEN', '2026-07-28 10:08:30.613737', 3),
(182, 'Zeon Charging Hub - Porbandar Industrial Area Road #7', 'Plot 357, Industrial Area Road, Porbandar, Gujarat', 'Porbandar', 'Gujarat', '360546', 21.61142280, 69.60745600, '06:00:00.000000', '22:59:00.000000', '9813700656', 'support.porbandar@zeoncharging.com', 'Restroom, Convenience Store', 4.5, 'OPEN', '2026-07-28 10:08:30.628709', 3),
(183, 'Tata Power Hub - Porbandar Industrial Area Road #8', 'Plot 67, Industrial Area Road, Porbandar, Gujarat', 'Porbandar', 'Gujarat', '360541', 21.64197550, 69.63800230, '00:00:00.000000', '23:59:00.000000', '9848264199', 'support.porbandar@tatapower.com', 'Restroom, Coffee Shop', 4.2, 'OPEN', '2026-07-28 10:08:30.648580', 3),
(184, 'Torrent Power Hub - Porbandar Link Road #9', 'Plot 228, Link Road, Porbandar, Gujarat', 'Porbandar', 'Gujarat', '360540', 21.64873340, 69.64490140, '06:00:00.000000', '23:59:00.000000', '9887016232', 'support.porbandar@torrentpower.com', 'Food Stall, Restroom', 4.6, 'OPEN', '2026-07-28 10:08:30.677721', 5),
(185, 'Jio-bp Pulse Hub - Porbandar Industrial Area Road #10', 'Plot 495, Industrial Area Road, Porbandar, Gujarat', 'Porbandar', 'Gujarat', '360550', 21.66170130, 69.59311660, '06:00:00.000000', '22:59:00.000000', '9854505841', 'support.porbandar@jiobppulse.com', 'Cafeteria, Restroom, Wi-Fi', 4.8, 'OPEN', '2026-07-28 10:08:30.696600', 3),
(186, 'Adani Gas EV Hub - Veraval Ring Road #1', 'Plot 55, Ring Road, Veraval, Gujarat', 'Veraval', 'Gujarat', '362298', 20.87705390, 70.38214570, '00:00:00.000000', '23:59:00.000000', '9897462594', 'support.veraval@adanigasev.com', 'Food Stall, Restroom', 4.4, 'OPEN', '2026-07-28 10:08:30.724376', 5),
(187, 'Zeon Charging Hub - Veraval Market Street #2', 'Plot 456, Market Street, Veraval, Gujarat', 'Veraval', 'Gujarat', '362269', 20.90690190, 70.34072900, '06:00:00.000000', '23:59:00.000000', '9879221573', 'support.veraval@zeoncharging.com', 'Cafeteria, Restroom, Wi-Fi', 4.1, 'OPEN', '2026-07-28 10:08:30.735595', 3),
(188, 'Torrent Power Hub - Veraval Link Road #3', 'Plot 383, Link Road, Veraval, Gujarat', 'Veraval', 'Gujarat', '362268', 20.95041450, 70.33696100, '08:00:00.000000', '22:59:00.000000', '9892547892', 'support.veraval@torrentpower.com', 'Cafeteria, Restroom, Wi-Fi', 4.1, 'OPEN', '2026-07-28 10:08:30.758455', 5),
(189, 'Zeon Charging Hub - Veraval Airport Road #4', 'Plot 415, Airport Road, Veraval, Gujarat', 'Veraval', 'Gujarat', '362252', 20.88221900, 70.38394590, '08:00:00.000000', '23:59:00.000000', '9896066639', 'support.veraval@zeoncharging.com', 'Restroom, Food Court Proximity', 4.6, 'OPEN', '2026-07-28 10:08:30.780488', 3),
(190, 'Jio-bp Pulse Hub - Veraval Link Road #5', 'Plot 232, Link Road, Veraval, Gujarat', 'Veraval', 'Gujarat', '362244', 20.91729340, 70.35848590, '06:00:00.000000', '22:00:00.000000', '9841010341', 'support.veraval@jiobppulse.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 4.7, 'OPEN', '2026-07-28 10:08:30.795233', 3),
(191, 'Tata Power Hub - Veraval City Center Road #6', 'Plot 126, City Center Road, Veraval, Gujarat', 'Veraval', 'Gujarat', '362270', 20.91891510, 70.38375950, '00:00:00.000000', '22:00:00.000000', '9812844458', 'support.veraval@tatapower.com', 'Restroom, Supermarket Proximity', 4.0, 'OPEN', '2026-07-28 10:08:30.810201', 3),
(192, 'Zeon Charging Hub - Veraval Station Road #7', 'Plot 392, Station Road, Veraval, Gujarat', 'Veraval', 'Gujarat', '362296', 20.95490630, 70.33339970, '00:00:00.000000', '22:00:00.000000', '9846328166', 'support.veraval@zeoncharging.com', 'Cafeteria, Restroom, Wi-Fi', 4.2, 'OPEN', '2026-07-28 10:08:30.837811', 3),
(193, 'Tata Power Hub - Veraval Station Road #8', 'Plot 92, Station Road, Veraval, Gujarat', 'Veraval', 'Gujarat', '362223', 20.94726010, 70.36584760, '08:00:00.000000', '23:00:00.000000', '9874691135', 'support.veraval@tatapower.com', 'Restroom, Convenience Store', 4.6, 'OPEN', '2026-07-28 10:08:30.870802', 3),
(194, 'Adani Gas EV Hub - Veraval GIDC Sector 2 #9', 'Plot 308, GIDC Sector 2, Veraval, Gujarat', 'Veraval', 'Gujarat', '362236', 20.87690290, 70.34224530, '08:00:00.000000', '22:00:00.000000', '9832119507', 'support.veraval@adanigasev.com', 'Restroom, Food Court Proximity', 4.1, 'OPEN', '2026-07-28 10:08:30.899239', 5),
(195, 'Torrent Power Hub - Veraval GIDC Sector 2 #10', 'Plot 494, GIDC Sector 2, Veraval, Gujarat', 'Veraval', 'Gujarat', '362298', 20.93467790, 70.39567830, '00:00:00.000000', '22:00:00.000000', '9836663975', 'support.veraval@torrentpower.com', 'Restroom, Coffee Shop', 4.9, 'OPEN', '2026-07-28 10:08:30.917382', 5),
(196, 'Jio-bp Pulse Hub - Godhra Ring Road #1', 'Plot 483, Ring Road, Godhra, Gujarat', 'Godhra', 'Gujarat', '389086', 22.74816130, 73.65236380, '08:00:00.000000', '23:59:00.000000', '9847201733', 'support.godhra@jiobppulse.com', 'Restroom, Food Court Proximity', 4.0, 'OPEN', '2026-07-28 10:08:30.934969', 3),
(197, 'Torrent Power Hub - Godhra Highway 48 Bypass #2', 'Plot 230, Highway 48 Bypass, Godhra, Gujarat', 'Godhra', 'Gujarat', '389041', 22.80769800, 73.59626770, '06:00:00.000000', '23:59:00.000000', '9812181553', 'support.godhra@torrentpower.com', 'Restroom, Food Court Proximity', 3.8, 'OPEN', '2026-07-28 10:08:30.957594', 5),
(198, 'Adani Gas EV Hub - Godhra College Road #3', 'Plot 472, College Road, Godhra, Gujarat', 'Godhra', 'Gujarat', '389081', 22.76638630, 73.62302310, '06:00:00.000000', '22:59:00.000000', '9863997403', 'support.godhra@adanigasev.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 4.8, 'OPEN', '2026-07-28 10:08:30.971104', 5),
(199, 'Jio-bp Pulse Hub - Godhra City Center Road #4', 'Plot 343, City Center Road, Godhra, Gujarat', 'Godhra', 'Gujarat', '389043', 22.80835420, 73.64349410, '00:00:00.000000', '23:59:00.000000', '9892860043', 'support.godhra@jiobppulse.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 4.4, 'OPEN', '2026-07-28 10:08:30.993293', 3),
(200, 'Jio-bp Pulse Hub - Godhra Industrial Area Road #5', 'Plot 402, Industrial Area Road, Godhra, Gujarat', 'Godhra', 'Gujarat', '389021', 22.73976010, 73.65421310, '08:00:00.000000', '22:00:00.000000', '9899631240', 'support.godhra@jiobppulse.com', 'Restroom, Supermarket Proximity', 4.7, 'OPEN', '2026-07-28 10:08:31.021310', 3),
(201, 'Torrent Power Hub - Godhra Highway 48 Bypass #6', 'Plot 42, Highway 48 Bypass, Godhra, Gujarat', 'Godhra', 'Gujarat', '389038', 22.80787690, 73.64551130, '00:00:00.000000', '22:59:00.000000', '9876072321', 'support.godhra@torrentpower.com', 'Restroom, Shopping Mall Proximity', 4.7, 'OPEN', '2026-07-28 10:08:31.048011', 5),
(202, 'Zeon Charging Hub - Godhra City Center Road #7', 'Plot 133, City Center Road, Godhra, Gujarat', 'Godhra', 'Gujarat', '389088', 22.75801720, 73.61292100, '08:00:00.000000', '22:59:00.000000', '9825214236', 'support.godhra@zeoncharging.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', 3.9, 'OPEN', '2026-07-28 10:08:31.061484', 3),
(203, 'Zeon Charging Hub - Godhra Industrial Area Road #8', 'Plot 354, Industrial Area Road, Godhra, Gujarat', 'Godhra', 'Gujarat', '389014', 22.76935390, 73.63394620, '08:00:00.000000', '22:59:00.000000', '9854421731', 'support.godhra@zeoncharging.com', 'Cafeteria, Restroom, Wi-Fi', 4.1, 'OPEN', '2026-07-28 10:08:31.075989', 3),
(204, 'Adani Gas EV Hub - Godhra Main Road #9', 'Plot 273, Main Road, Godhra, Gujarat', 'Godhra', 'Gujarat', '389038', 22.74584270, 73.62600760, '08:00:00.000000', '22:59:00.000000', '9835112570', 'support.godhra@adanigasev.com', 'Restroom, Coffee Shop', 3.8, 'OPEN', '2026-07-28 10:08:31.091161', 5),
(205, 'Jio-bp Pulse Hub - Godhra Link Road #10', 'Plot 312, Link Road, Godhra, Gujarat', 'Godhra', 'Gujarat', '389078', 22.76576050, 73.58822350, '06:00:00.000000', '22:59:00.000000', '9838415980', 'support.godhra@jiobppulse.com', 'Restroom, Convenience Store', 4.7, 'OPEN', '2026-07-28 10:08:31.119998', 3);

-- --------------------------------------------------------

--
-- Table structure for table `trips_trip`
--

CREATE TABLE `trips_trip` (
  `id` bigint(20) NOT NULL,
  `source` varchar(200) NOT NULL,
  `distance_km` decimal(8,2) DEFAULT NULL,
  `estimated_time` int(10) UNSIGNED DEFAULT NULL,
  `estimated_battery_needed` decimal(5,2) DEFAULT NULL,
  `trip_status` varchar(20) NOT NULL,
  `start_time` datetime(6) DEFAULT NULL,
  `end_time` datetime(6) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `suggested_station_id` bigint(20) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL,
  `vehicle_id` bigint(20) NOT NULL,
  `destination_latitude` decimal(10,7) DEFAULT NULL,
  `destination_longitude` decimal(10,7) DEFAULT NULL,
  `source_latitude` decimal(10,7) DEFAULT NULL,
  `source_longitude` decimal(10,7) DEFAULT NULL,
  `destination` varchar(200) NOT NULL,
  `battery_before` decimal(5,2) DEFAULT NULL,
  `estimated_duration` int(10) UNSIGNED DEFAULT NULL CHECK (`estimated_duration` >= 0),
  `external_station_connector_type` varchar(50) DEFAULT NULL,
  `external_station_estimated_wait_time` int(10) UNSIGNED DEFAULT NULL CHECK (`external_station_estimated_wait_time` >= 0),
  `external_station_id` varchar(100) DEFAULT NULL,
  `external_station_latitude` decimal(10,7) DEFAULT NULL,
  `external_station_longitude` decimal(10,7) DEFAULT NULL,
  `external_station_name` varchar(255) DEFAULT NULL,
  `external_station_operator` varchar(255) DEFAULT NULL,
  `predicted_battery_after` decimal(5,2) DEFAULT NULL,
  `route_distance` decimal(8,2) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `trips_trip`
--

INSERT INTO `trips_trip` (`id`, `source`, `distance_km`, `estimated_time`, `estimated_battery_needed`, `trip_status`, `start_time`, `end_time`, `created_at`, `suggested_station_id`, `user_id`, `vehicle_id`, `destination_latitude`, `destination_longitude`, `source_latitude`, `source_longitude`, `destination`, `battery_before`, `estimated_duration`, `external_station_connector_type`, `external_station_estimated_wait_time`, `external_station_id`, `external_station_latitude`, `external_station_longitude`, `external_station_name`, `external_station_operator`, `predicted_battery_after`, `route_distance`) VALUES
(4, 'Surat', 290.00, 300, 89.00, 'PLANNED', '2026-07-06 18:12:37.000000', '2026-07-07 00:30:00.000000', '2026-07-06 18:12:50.076497', 1, 2, 1, 24.8956890, 24.5689740, 23.5689450, 23.5689750, 'Ahmedabad', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(5, 'Ahmedabad', 251.72, 174, 80.00, 'PLANNED', NULL, NULL, '2026-07-10 07:43:58.531142', 1, 2, 1, NULL, NULL, NULL, NULL, 'Surat', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(6, 'Current Location', 5.00, 15, 2.08, 'PLANNED', NULL, NULL, '2026-07-11 10:42:51.990054', 1, 2, 1, 27.8005545, 28.8777980, 27.8005545, 28.8777980, 'TORENT EV', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(7, 'Current Location', 5.00, 15, 2.08, 'PLANNED', NULL, NULL, '2026-07-11 11:28:53.971316', 1, 2, 1, 23.0551776, 72.5439939, 23.0551776, 72.5439939, 'TORENT EV', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(8, 'Current Location', 5.00, 15, 2.08, 'PLANNED', NULL, NULL, '2026-07-11 11:28:57.219733', 1, 2, 1, 23.0551776, 72.5439939, 23.0551776, 72.5439939, 'TORENT EV', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(9, 'Bopal, Ahmedabad', 260.00, 270, 45.00, 'PLANNED', NULL, NULL, '2026-07-28 10:27:34.514936', NULL, 2, 1, 21.1700000, 72.8300000, 23.0300000, 72.4700000, 'Surat', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(10, 'Bopal, Ahmedabad', 260.00, 270, 45.00, 'PLANNED', NULL, NULL, '2026-07-28 10:28:33.755827', NULL, 2, 1, 21.1700000, 72.8300000, 23.0300000, 72.4700000, 'Surat', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(11, 'Bopal, Ahmedabad', 260.00, 270, 45.00, 'PLANNED', NULL, NULL, '2026-07-28 10:28:53.342528', NULL, 2, 1, 21.1700000, 72.8300000, 23.0300000, 72.4700000, 'Surat', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(12, 'Bopal, Ahmedabad', 260.00, 270, 45.00, 'PLANNED', NULL, NULL, '2026-07-28 10:29:26.004398', NULL, 2, 1, 21.1700000, 72.8300000, 23.0300000, 72.4700000, 'Surat', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(13, 'Bopal, Ahmedabad', 260.00, 270, 45.00, 'PLANNED', NULL, NULL, '2026-07-28 10:38:20.771162', NULL, 2, 1, 21.1700000, 72.8300000, 23.0300000, 72.4700000, 'Surat', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(14, 'Bopal, Ahmedabad', 260.00, 270, 39.00, 'PLANNED', NULL, NULL, '2026-07-28 10:38:33.732584', NULL, 2, 2, 21.1700000, 72.8300000, 23.0300000, 72.4700000, 'Surat', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL),
(15, 'Bopal, Ahmedabad', 260.00, 270, 39.00, 'PLANNED', NULL, NULL, '2026-07-28 10:56:28.426235', NULL, 2, 2, 21.1700000, 72.8300000, 23.0300000, 72.4700000, 'Surat', NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL);

-- --------------------------------------------------------

--
-- Table structure for table `users_user`
--

CREATE TABLE `users_user` (
  `id` bigint(20) NOT NULL,
  `password` varchar(128) NOT NULL,
  `last_login` datetime(6) DEFAULT NULL,
  `is_superuser` tinyint(1) NOT NULL,
  `username` varchar(150) NOT NULL,
  `first_name` varchar(150) NOT NULL,
  `last_name` varchar(150) NOT NULL,
  `email` varchar(254) NOT NULL,
  `is_staff` tinyint(1) NOT NULL,
  `is_active` tinyint(1) NOT NULL,
  `date_joined` datetime(6) NOT NULL,
  `role` varchar(20) NOT NULL,
  `phone` varchar(15) DEFAULT NULL,
  `profile_image` varchar(100) DEFAULT NULL,
  `address` longtext DEFAULT NULL,
  `city` varchar(50) DEFAULT NULL,
  `state` varchar(50) DEFAULT NULL,
  `pincode` varchar(10) DEFAULT NULL,
  `is_verified` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `users_user`
--

INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`, `role`, `phone`, `profile_image`, `address`, `city`, `state`, `pincode`, `is_verified`) VALUES
(1, 'pbkdf2_sha256$600000$X8RIlG6hiZn5PoQu4rweDi$Fz33EyBV0FfKgKulzhiuVnXrxZnISUR1IiTcL5l97IA=', '2026-07-08 17:46:12.000000', 1, 'evchargex', '', '', 'desaitanay35@gmail.com', 1, 1, '2026-07-06 17:14:31.000000', 'ADMIN', NULL, '', '', NULL, NULL, NULL, 0),
(2, 'pbkdf2_sha256$1200000$HzMSuezppb7u2AoGnDsE1l$d3iI/qVT4C5oUSpml9+u6Iqbt1P58L0m3Vs9DIc+vaQ=', '2026-07-06 17:47:43.000000', 0, 'Tanay', 'Tanay', 'Desai', 'desaitanay35@gmail.com', 0, 1, '2026-07-06 17:47:28.000000', 'USER', '6352916072', '', '13/156 gokul apt,parasnagar, sola road ,ahmedabad', 'Ahmedabad', 'Gujarat', '380063', 0),
(3, 'pbkdf2_sha256$600000$wm8Cfl6XoFpCDCDEWQN6zl$QG1loOBhSTpuan5nzpGdH7K2PgBDan+ByPjBNHyLxNA=', '2026-07-06 17:59:05.000000', 0, 'TATA', 'Tanay', 'Desai', 'desaitanay83@gmail.com', 0, 1, '2026-07-06 17:58:47.000000', 'OPERATOR', '6352916089', '', '13/156 gokul apt,parasnagar, sola road ,ahmedabad', 'Ahmedabad', 'Gujarat', '380063', 0),
(4, 'pbkdf2_sha256$600000$KzJk4OthgZbxK80nW4qW8a$lF165JlgIlXB1e9N8skYGnE4YaRfuE2f3jhzlZZ6qiY=', NULL, 0, 'testuser', '', '', 'testuser@example.com', 0, 1, '2026-07-07 17:50:10.257500', 'USER', '9876543210', '', '123 Test Street', 'Ahmedabad', 'Gujarat', '380009', 0),
(5, 'pbkdf2_sha256$600000$LhluluOadyJrAPoOlpcqza$KTarT06kfhUN955nt4cYW1oPS16zlpF45/McFZMINMw=', '2026-07-09 10:17:35.000000', 0, 'Torent', 'Tanay', 'Desai', 'desai@gmail.com', 0, 1, '2026-07-09 10:17:07.000000', 'OPERATOR', '8956237415', '', '13/155,Gokul appertment, Sola Road,naranpura', 'Ahmedabad', 'Gujarat', '380063', 0),
(6, 'pbkdf2_sha256$600000$fHquJYuTxsdp0f2x3hSpRE$fD6J3AAPFi6QphP1sA/tmWc2vgntVjkpINH+zr1VhxU=', NULL, 0, 'darshan', '', '', 'darshan@gmail.com', 0, 1, '2026-07-28 09:39:29.892905', 'USER', '7489561230', '', NULL, 'Ahmedabad', 'Gujarat', NULL, 0);

-- --------------------------------------------------------

--
-- Table structure for table `users_user_groups`
--

CREATE TABLE `users_user_groups` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `group_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `users_user_user_permissions`
--

CREATE TABLE `users_user_user_permissions` (
  `id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `permission_id` int(11) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- --------------------------------------------------------

--
-- Table structure for table `vehicles_vehicle`
--

CREATE TABLE `vehicles_vehicle` (
  `id` bigint(20) NOT NULL,
  `vehicle_type` varchar(10) NOT NULL,
  `brand` varchar(50) NOT NULL,
  `model` varchar(50) NOT NULL,
  `variant` varchar(50) DEFAULT NULL,
  `registration_number` varchar(20) NOT NULL,
  `battery_capacity` decimal(6,2) NOT NULL,
  `current_battery_percentage` decimal(5,2) NOT NULL,
  `connector_type` varchar(20) NOT NULL,
  `efficiency` decimal(5,2) NOT NULL,
  `manufacturing_year` int(10) UNSIGNED NOT NULL CHECK (`manufacturing_year` >= 0),
  `color` varchar(30) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `user_id` bigint(20) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

--
-- Dumping data for table `vehicles_vehicle`
--

INSERT INTO `vehicles_vehicle` (`id`, `vehicle_type`, `brand`, `model`, `variant`, `registration_number`, `battery_capacity`, `current_battery_percentage`, `connector_type`, `efficiency`, `manufacturing_year`, `color`, `created_at`, `user_id`) VALUES
(1, 'Car', 'BMW', 'ix', 'xDrive 50', 'abc8307', 60.00, 25.00, 'Type2', 5.00, 2026, 'Black Sapphire', '2026-07-06 17:53:30.743545', 2),
(2, 'Car', 'Tata', 'Nexon EV', NULL, 'GJ01XY8307', 40.50, 40.00, 'CCS2', 0.15, 2025, NULL, '2026-07-11 10:45:26.292071', 2),
(3, 'Car', 'tasela', 'er4', 'tt', 'GJO1ER3421', 23.00, 20.00, 'CCS2', 0.15, 2024, '', '2026-07-28 09:41:14.342731', 6);

--
-- Indexes for dumped tables
--

--
-- Indexes for table `authtoken_token`
--
ALTER TABLE `authtoken_token`
  ADD PRIMARY KEY (`key`),
  ADD UNIQUE KEY `user_id` (`user_id`);

--
-- Indexes for table `auth_group`
--
ALTER TABLE `auth_group`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `name` (`name`);

--
-- Indexes for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  ADD KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`);

--
-- Indexes for table `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`);

--
-- Indexes for table `bookings_booking`
--
ALTER TABLE `bookings_booking`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `bookings_booking_qr_code_84817c9e_uniq` (`qr_code`),
  ADD KEY `bookings_booking_charger_id_a2009feb_fk_charging_charger_id` (`charger_id`),
  ADD KEY `bookings_booking_station_id_4de720de_fk_stations_station_id` (`station_id`),
  ADD KEY `bookings_booking_trip_id_1cf36b39_fk_trips_trip_id` (`trip_id`),
  ADD KEY `bookings_booking_user_id_834dfc23_fk_users_user_id` (`user_id`);

--
-- Indexes for table `charging_charger`
--
ALTER TABLE `charging_charger`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `charger_number` (`charger_number`),
  ADD KEY `charging_charger_station_id_e6b70075_fk_stations_station_id` (`station_id`);

--
-- Indexes for table `charging_chargingsession`
--
ALTER TABLE `charging_chargingsession`
  ADD PRIMARY KEY (`id`),
  ADD KEY `charging_chargingses_booking_id_9bdc06a4_fk_bookings_` (`booking_id`),
  ADD KEY `charging_chargingses_charger_id_020acec9_fk_charging_` (`charger_id`),
  ADD KEY `charging_chargingses_vehicle_id_746b5094_fk_vehicles_` (`vehicle_id`);

--
-- Indexes for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD PRIMARY KEY (`id`),
  ADD KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  ADD KEY `django_admin_log_user_id_c564eba6_fk_users_user_id` (`user_id`);

--
-- Indexes for table `django_content_type`
--
ALTER TABLE `django_content_type`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`);

--
-- Indexes for table `django_migrations`
--
ALTER TABLE `django_migrations`
  ADD PRIMARY KEY (`id`);

--
-- Indexes for table `django_session`
--
ALTER TABLE `django_session`
  ADD PRIMARY KEY (`session_key`),
  ADD KEY `django_session_expire_date_a5c62663` (`expire_date`);

--
-- Indexes for table `favorites_favoritestation`
--
ALTER TABLE `favorites_favoritestation`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `favorites_favoritestation_user_id_station_id_8ed884b1_uniq` (`user_id`,`station_id`),
  ADD KEY `favorites_favoritest_station_id_6e6642a1_fk_stations_` (`station_id`);

--
-- Indexes for table `notifications_notification`
--
ALTER TABLE `notifications_notification`
  ADD PRIMARY KEY (`id`),
  ADD KEY `notifications_notification_user_id_b5e8c0ff_fk_users_user_id` (`user_id`);

--
-- Indexes for table `payments_payment`
--
ALTER TABLE `payments_payment`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `charging_session_id` (`charging_session_id`),
  ADD KEY `payments_payment_user_id_f9db060a_fk_users_user_id` (`user_id`);

--
-- Indexes for table `reviews_review`
--
ALTER TABLE `reviews_review`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `reviews_review_user_id_station_id_e40e2820_uniq` (`user_id`,`station_id`),
  ADD KEY `reviews_review_station_id_87b2e205_fk_stations_station_id` (`station_id`);

--
-- Indexes for table `stations_station`
--
ALTER TABLE `stations_station`
  ADD PRIMARY KEY (`id`),
  ADD KEY `stations_station_operator_id_42920f79_fk_users_user_id` (`operator_id`);

--
-- Indexes for table `trips_trip`
--
ALTER TABLE `trips_trip`
  ADD PRIMARY KEY (`id`),
  ADD KEY `trips_trip_suggested_station_id_ffeb346b_fk_stations_station_id` (`suggested_station_id`),
  ADD KEY `trips_trip_user_id_b33c249a_fk_users_user_id` (`user_id`),
  ADD KEY `trips_trip_vehicle_id_e21456ae_fk_vehicles_vehicle_id` (`vehicle_id`);

--
-- Indexes for table `users_user`
--
ALTER TABLE `users_user`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `username` (`username`),
  ADD UNIQUE KEY `phone` (`phone`);

--
-- Indexes for table `users_user_groups`
--
ALTER TABLE `users_user_groups`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_user_groups_user_id_group_id_b88eab82_uniq` (`user_id`,`group_id`),
  ADD KEY `users_user_groups_group_id_9afc8d0e_fk_auth_group_id` (`group_id`);

--
-- Indexes for table `users_user_user_permissions`
--
ALTER TABLE `users_user_user_permissions`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `users_user_user_permissions_user_id_permission_id_43338c45_uniq` (`user_id`,`permission_id`),
  ADD KEY `users_user_user_perm_permission_id_0b93982e_fk_auth_perm` (`permission_id`);

--
-- Indexes for table `vehicles_vehicle`
--
ALTER TABLE `vehicles_vehicle`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `registration_number` (`registration_number`),
  ADD KEY `vehicles_vehicle_user_id_96a55eeb_fk_users_user_id` (`user_id`);

--
-- AUTO_INCREMENT for dumped tables
--

--
-- AUTO_INCREMENT for table `auth_group`
--
ALTER TABLE `auth_group`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `auth_permission`
--
ALTER TABLE `auth_permission`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=73;

--
-- AUTO_INCREMENT for table `bookings_booking`
--
ALTER TABLE `bookings_booking`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- AUTO_INCREMENT for table `charging_charger`
--
ALTER TABLE `charging_charger`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=710;

--
-- AUTO_INCREMENT for table `charging_chargingsession`
--
ALTER TABLE `charging_chargingsession`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT for table `django_content_type`
--
ALTER TABLE `django_content_type`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=19;

--
-- AUTO_INCREMENT for table `django_migrations`
--
ALTER TABLE `django_migrations`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=46;

--
-- AUTO_INCREMENT for table `favorites_favoritestation`
--
ALTER TABLE `favorites_favoritestation`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=3;

--
-- AUTO_INCREMENT for table `notifications_notification`
--
ALTER TABLE `notifications_notification`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=28;

--
-- AUTO_INCREMENT for table `payments_payment`
--
ALTER TABLE `payments_payment`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT for table `reviews_review`
--
ALTER TABLE `reviews_review`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT for table `stations_station`
--
ALTER TABLE `stations_station`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=206;

--
-- AUTO_INCREMENT for table `trips_trip`
--
ALTER TABLE `trips_trip`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=16;

--
-- AUTO_INCREMENT for table `users_user`
--
ALTER TABLE `users_user`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT for table `users_user_groups`
--
ALTER TABLE `users_user_groups`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `users_user_user_permissions`
--
ALTER TABLE `users_user_user_permissions`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT for table `vehicles_vehicle`
--
ALTER TABLE `vehicles_vehicle`
  MODIFY `id` bigint(20) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Constraints for dumped tables
--

--
-- Constraints for table `authtoken_token`
--
ALTER TABLE `authtoken_token`
  ADD CONSTRAINT `authtoken_token_user_id_35299eff_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`);

--
-- Constraints for table `auth_group_permissions`
--
ALTER TABLE `auth_group_permissions`
  ADD CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`);

--
-- Constraints for table `auth_permission`
--
ALTER TABLE `auth_permission`
  ADD CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`);

--
-- Constraints for table `bookings_booking`
--
ALTER TABLE `bookings_booking`
  ADD CONSTRAINT `bookings_booking_charger_id_a2009feb_fk_charging_charger_id` FOREIGN KEY (`charger_id`) REFERENCES `charging_charger` (`id`),
  ADD CONSTRAINT `bookings_booking_station_id_4de720de_fk_stations_station_id` FOREIGN KEY (`station_id`) REFERENCES `stations_station` (`id`),
  ADD CONSTRAINT `bookings_booking_trip_id_1cf36b39_fk_trips_trip_id` FOREIGN KEY (`trip_id`) REFERENCES `trips_trip` (`id`),
  ADD CONSTRAINT `bookings_booking_user_id_834dfc23_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`);

--
-- Constraints for table `charging_charger`
--
ALTER TABLE `charging_charger`
  ADD CONSTRAINT `charging_charger_station_id_e6b70075_fk_stations_station_id` FOREIGN KEY (`station_id`) REFERENCES `stations_station` (`id`);

--
-- Constraints for table `charging_chargingsession`
--
ALTER TABLE `charging_chargingsession`
  ADD CONSTRAINT `charging_chargingses_booking_id_9bdc06a4_fk_bookings_` FOREIGN KEY (`booking_id`) REFERENCES `bookings_booking` (`id`),
  ADD CONSTRAINT `charging_chargingses_charger_id_020acec9_fk_charging_` FOREIGN KEY (`charger_id`) REFERENCES `charging_charger` (`id`),
  ADD CONSTRAINT `charging_chargingses_vehicle_id_746b5094_fk_vehicles_` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles_vehicle` (`id`);

--
-- Constraints for table `django_admin_log`
--
ALTER TABLE `django_admin_log`
  ADD CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  ADD CONSTRAINT `django_admin_log_user_id_c564eba6_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`);

--
-- Constraints for table `favorites_favoritestation`
--
ALTER TABLE `favorites_favoritestation`
  ADD CONSTRAINT `favorites_favoritest_station_id_6e6642a1_fk_stations_` FOREIGN KEY (`station_id`) REFERENCES `stations_station` (`id`),
  ADD CONSTRAINT `favorites_favoritestation_user_id_f92aca6c_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`);

--
-- Constraints for table `notifications_notification`
--
ALTER TABLE `notifications_notification`
  ADD CONSTRAINT `notifications_notification_user_id_b5e8c0ff_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`);

--
-- Constraints for table `payments_payment`
--
ALTER TABLE `payments_payment`
  ADD CONSTRAINT `payments_payment_charging_session_id_55a13d16_fk_charging_` FOREIGN KEY (`charging_session_id`) REFERENCES `charging_chargingsession` (`id`),
  ADD CONSTRAINT `payments_payment_user_id_f9db060a_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`);

--
-- Constraints for table `reviews_review`
--
ALTER TABLE `reviews_review`
  ADD CONSTRAINT `reviews_review_station_id_87b2e205_fk_stations_station_id` FOREIGN KEY (`station_id`) REFERENCES `stations_station` (`id`),
  ADD CONSTRAINT `reviews_review_user_id_875caff2_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`);

--
-- Constraints for table `stations_station`
--
ALTER TABLE `stations_station`
  ADD CONSTRAINT `stations_station_operator_id_42920f79_fk_users_user_id` FOREIGN KEY (`operator_id`) REFERENCES `users_user` (`id`);

--
-- Constraints for table `trips_trip`
--
ALTER TABLE `trips_trip`
  ADD CONSTRAINT `trips_trip_suggested_station_id_ffeb346b_fk_stations_station_id` FOREIGN KEY (`suggested_station_id`) REFERENCES `stations_station` (`id`),
  ADD CONSTRAINT `trips_trip_user_id_b33c249a_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`),
  ADD CONSTRAINT `trips_trip_vehicle_id_e21456ae_fk_vehicles_vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles_vehicle` (`id`);

--
-- Constraints for table `users_user_groups`
--
ALTER TABLE `users_user_groups`
  ADD CONSTRAINT `users_user_groups_group_id_9afc8d0e_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  ADD CONSTRAINT `users_user_groups_user_id_5f6f5a90_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`);

--
-- Constraints for table `users_user_user_permissions`
--
ALTER TABLE `users_user_user_permissions`
  ADD CONSTRAINT `users_user_user_perm_permission_id_0b93982e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  ADD CONSTRAINT `users_user_user_permissions_user_id_20aca447_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`);

--
-- Constraints for table `vehicles_vehicle`
--
ALTER TABLE `vehicles_vehicle`
  ADD CONSTRAINT `vehicles_vehicle_user_id_96a55eeb_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
