-- EV ChargeX Pre-Merge Database Backup
SET FOREIGN_KEY_CHECKS=0;

-- Table structure for table `auth_group`
DROP TABLE IF EXISTS `auth_group`;
CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `auth_group_permissions`
DROP TABLE IF EXISTS `auth_group_permissions`;
CREATE TABLE `auth_group_permissions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `group_id` int(11) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_group_permissions_group_id_permission_id_0cd325b0_uniq` (`group_id`,`permission_id`),
  KEY `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `auth_group_permissio_permission_id_84c5c92e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `auth_group_permissions_group_id_b120cbf9_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `auth_permission`
DROP TABLE IF EXISTS `auth_permission`;
CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=73 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `auth_permission`
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

-- Table structure for table `authtoken_token`
DROP TABLE IF EXISTS `authtoken_token`;
CREATE TABLE `authtoken_token` (
  `key` varchar(40) NOT NULL,
  `created` datetime(6) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`key`),
  UNIQUE KEY `user_id` (`user_id`),
  CONSTRAINT `authtoken_token_user_id_35299eff_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `bookings_booking`
DROP TABLE IF EXISTS `bookings_booking`;
CREATE TABLE `bookings_booking` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `booking_date` date NOT NULL,
  `booking_start_time` time(6) NOT NULL,
  `booking_end_time` time(6) NOT NULL,
  `estimated_duration` int(10) unsigned NOT NULL CHECK (`estimated_duration` >= 0),
  `booking_status` varchar(20) NOT NULL,
  `qr_code` varchar(255) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `charger_id` bigint(20) NOT NULL,
  `station_id` bigint(20) NOT NULL,
  `trip_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `is_qr_used` tinyint(1) NOT NULL,
  `is_verified` tinyint(1) NOT NULL,
  `qr_image` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `bookings_booking_qr_code_84817c9e_uniq` (`qr_code`),
  KEY `bookings_booking_charger_id_a2009feb_fk_charging_charger_id` (`charger_id`),
  KEY `bookings_booking_station_id_4de720de_fk_stations_station_id` (`station_id`),
  KEY `bookings_booking_trip_id_1cf36b39_fk_trips_trip_id` (`trip_id`),
  KEY `bookings_booking_user_id_834dfc23_fk_users_user_id` (`user_id`),
  CONSTRAINT `bookings_booking_charger_id_a2009feb_fk_charging_charger_id` FOREIGN KEY (`charger_id`) REFERENCES `charging_charger` (`id`),
  CONSTRAINT `bookings_booking_station_id_4de720de_fk_stations_station_id` FOREIGN KEY (`station_id`) REFERENCES `stations_station` (`id`),
  CONSTRAINT `bookings_booking_trip_id_1cf36b39_fk_trips_trip_id` FOREIGN KEY (`trip_id`) REFERENCES `trips_trip` (`id`),
  CONSTRAINT `bookings_booking_user_id_834dfc23_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `bookings_booking`
INSERT INTO `bookings_booking` (`id`, `booking_date`, `booking_start_time`, `booking_end_time`, `estimated_duration`, `booking_status`, `qr_code`, `created_at`, `charger_id`, `station_id`, `trip_id`, `user_id`, `is_qr_used`, `is_verified`, `qr_image`) VALUES
(1, '2026-07-07', '23:43:44', '00:20:00', 25, 'COMPLETED', 'EV-BKG-92870E95F6', '2026-07-07 18:14:15.528422', 1, 1, 4, 2, 0, 0, 'booking_qr/booking_1.png'),
(3, '2026-07-09', '18:00:00', '19:00:00', 60, 'COMPLETED', 'EV-BKG-3-65FE9D', '2026-07-09 10:56:17.146472', 1, 1, 4, 2, 1, 0, 'booking_qr/booking_3.png'),
(7, '2026-07-10', '18:00:00', '19:00:00', 60, 'COMPLETED', 'EV-BKG-7-C8C23D', '2026-07-09 17:28:12.938572', 1, 1, 4, 2, 1, 0, 'booking_qr/booking_7.png'),
(8, '2026-07-10', '20:00:00', '21:00:00', 60, 'COMPLETED', 'EV-BKG-8-E98EA1', '2026-07-09 17:45:08.984107', 1, 1, 4, 2, 1, 0, 'booking_qr/booking_8.png'),
(9, '2026-07-10', '19:00:00', '20:00:00', 60, 'COMPLETED', 'EV-BKG-9-59CFA2', '2026-07-09 18:09:34.014505', 1, 1, 4, 2, 1, 1, 'booking_qr/booking_9.png'),
(11, '2026-07-25', '10:00:00', '11:00:00', 60, 'COMPLETED', 'EV-BKG-11-10231A', '2026-07-24 19:20:52.818810', 1, 1, 4, 2, 1, 1, 'booking_qr/booking_11.png');

-- Table structure for table `charging_charger`
DROP TABLE IF EXISTS `charging_charger`;
CREATE TABLE `charging_charger` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `charger_name` varchar(50) NOT NULL,
  `charger_number` varchar(20) NOT NULL,
  `charger_type` varchar(10) NOT NULL,
  `connector_type` varchar(20) NOT NULL,
  `power_output_kw` decimal(6,2) NOT NULL,
  `voltage` int(10) unsigned NOT NULL CHECK (`voltage` >= 0),
  `current` int(10) unsigned NOT NULL CHECK (`current` >= 0),
  `price_per_kwh` decimal(8,2) NOT NULL,
  `status` varchar(20) NOT NULL,
  `installation_date` date NOT NULL,
  `last_maintenance` date DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `station_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `charger_number` (`charger_number`),
  KEY `charging_charger_station_id_e6b70075_fk_stations_station_id` (`station_id`),
  CONSTRAINT `charging_charger_station_id_e6b70075_fk_stations_station_id` FOREIGN KEY (`station_id`) REFERENCES `stations_station` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `charging_charger`
INSERT INTO `charging_charger` (`id`, `charger_name`, `charger_number`, `charger_type`, `connector_type`, `power_output_kw`, `voltage`, `current`, `price_per_kwh`, `status`, `installation_date`, `last_maintenance`, `created_at`, `station_id`) VALUES
(1, 'AC-Fast', '01', 'AC', 'Type2', '65.00', 42, 410, '13.00', 'AVAILABLE', '2026-07-07', '2026-07-07', '2026-07-07 18:13:25.802932', 1),
(2, 'AC-Fast', '02', 'DC', 'CCS2', '30.00', 400, 80, '12.00', 'AVAILABLE', '2026-07-24', '2026-07-20', '2026-07-24 19:27:44.739342', 1);

-- Table structure for table `charging_chargingsession`
DROP TABLE IF EXISTS `charging_chargingsession`;
CREATE TABLE `charging_chargingsession` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
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
  `vehicle_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `charging_chargingses_booking_id_9bdc06a4_fk_bookings_` (`booking_id`),
  KEY `charging_chargingses_charger_id_020acec9_fk_charging_` (`charger_id`),
  KEY `charging_chargingses_vehicle_id_746b5094_fk_vehicles_` (`vehicle_id`),
  CONSTRAINT `charging_chargingses_booking_id_9bdc06a4_fk_bookings_` FOREIGN KEY (`booking_id`) REFERENCES `bookings_booking` (`id`),
  CONSTRAINT `charging_chargingses_charger_id_020acec9_fk_charging_` FOREIGN KEY (`charger_id`) REFERENCES `charging_charger` (`id`),
  CONSTRAINT `charging_chargingses_vehicle_id_746b5094_fk_vehicles_` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles_vehicle` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `charging_chargingsession`
INSERT INTO `charging_chargingsession` (`id`, `start_time`, `end_time`, `battery_before`, `battery_after`, `energy_consumed_kwh`, `charging_cost`, `session_status`, `created_at`, `booking_id`, `charger_id`, `vehicle_id`) VALUES
(1, '2026-07-07 18:14:29', '2026-07-09 17:10:37.838130', '54.00', '85.00', '18.60', '241.80', 'COMPLETED', '2026-07-07 18:15:19.720046', 1, 1, 1),
(2, '2026-07-07 18:47:44', '2026-07-09 18:24:35.088854', '20.00', '80.00', '56.00', '569.00', 'COMPLETED', '2026-07-07 18:48:23.207205', 1, 1, 1),
(3, '2026-07-07 18:50:11', '2026-07-07 19:13:39.635983', '20.00', '90.00', '42.00', '546.00', 'COMPLETED', '2026-07-07 18:50:34.181211', 1, 1, 1),
(4, '2026-07-09 17:47:00.340982', '2026-07-10 07:44:30.772000', '89.00', '91.40', '1.44', '18.72', 'COMPLETED', '2026-07-09 17:47:00.341528', 8, 1, 1),
(5, '2026-07-09 18:12:47.313147', '2026-07-10 10:54:16.594414', '89.00', '99.00', '6.00', '78.00', 'COMPLETED', '2026-07-09 18:12:47.313743', 9, 1, 1),
(6, '2026-07-19 09:47:59.060375', '2026-07-23 16:45:44.255437', '99.00', '100.00', '0.60', '7.80', 'COMPLETED', '2026-07-19 09:47:59.061028', 3, 1, 1),
(7, '2026-07-24 20:40:57.190245', '2026-07-24 21:22:44.349426', '40.00', '95.45', '33.27', '432.48', 'COMPLETED', '2026-07-24 20:40:57.190713', 11, 1, 1);

-- Table structure for table `django_admin_log`
DROP TABLE IF EXISTS `django_admin_log`;
CREATE TABLE `django_admin_log` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `action_time` datetime(6) NOT NULL,
  `object_id` longtext DEFAULT NULL,
  `object_repr` varchar(200) NOT NULL,
  `action_flag` smallint(5) unsigned NOT NULL CHECK (`action_flag` >= 0),
  `change_message` longtext NOT NULL,
  `content_type_id` int(11) DEFAULT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `django_admin_log_content_type_id_c4bce8eb_fk_django_co` (`content_type_id`),
  KEY `django_admin_log_user_id_c564eba6_fk_users_user_id` (`user_id`),
  CONSTRAINT `django_admin_log_content_type_id_c4bce8eb_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`),
  CONSTRAINT `django_admin_log_user_id_c564eba6_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=33 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `django_admin_log`
INSERT INTO `django_admin_log` (`id`, `action_time`, `object_id`, `object_repr`, `action_flag`, `change_message`, `content_type_id`, `user_id`) VALUES
(1, '2026-07-06 17:47:28.803482', '2', 'Tanay', 1, '[{"added": {}}]', 14, 1),
(2, '2026-07-06 17:47:55.186796', '2', 'Tanay', 2, '[{"changed": {"fields": ["First name", "Last name", "Email address", "Last login", "Address", "City", "State", "Pincode"]}}]', 14, 1),
(3, '2026-07-06 17:53:30.747287', '1', 'BMW ix (abc8307)', 1, '[{"added": {}}]', 11, 1),
(4, '2026-07-06 17:58:47.832591', '3', 'TATA', 1, '[{"added": {}}]', 14, 1),
(5, '2026-07-06 17:59:12.751245', '3', 'TATA', 2, '[{"changed": {"fields": ["First name", "Last name", "Email address", "Last login", "Address", "City", "State", "Pincode"]}}]', 14, 1),
(6, '2026-07-06 18:00:17.269811', '1', 'TORENT EV', 1, '[{"added": {}}]', 12, 1),
(7, '2026-07-06 18:12:50.082107', '4', 'Surat ➜ Ahmedabad', 1, '[{"added": {}}]', 13, 1),
(8, '2026-07-07 18:13:25.804957', '1', 'TORENT EV - AC-Fast', 1, '[{"added": {}}]', 7, 1),
(9, '2026-07-07 18:14:15.530768', '1', 'Booking #1', 1, '[{"added": {}}]', 6, 1),
(10, '2026-07-07 18:15:19.732795', '1', 'Session #1', 1, '[{"added": {}}]', 8, 1),
(11, '2026-07-07 18:48:23.223139', '2', 'Session #2', 1, '[{"added": {}}]', 8, 1),
(12, '2026-07-07 18:50:34.191751', '3', 'Session #3', 1, '[{"added": {}}]', 8, 1),
(13, '2026-07-08 17:57:09.414809', '1', 'desaitanay35@gmail.com - TORENT EV', 1, '[{"added": {}}]', 16, 1),
(14, '2026-07-08 18:02:03.654791', '2', 'desaitanay35@gmail.com - TORENT EV', 1, '[{"added": {}}]', 16, 1),
(15, '2026-07-09 10:17:08.252676', '5', 'Torent', 1, '[{"added": {}}]', 14, 1),
(16, '2026-07-09 10:17:40.284448', '5', 'Torent', 2, '[{"changed": {"fields": ["First name", "Last name", "Email address", "Last login", "Address", "City", "State", "Pincode"]}}]', 14, 1),
(17, '2026-07-09 10:25:18.432198', '1', 'evchargex', 2, '[{"changed": {"fields": ["Role"]}}]', 14, 1),
(18, '2026-07-09 10:41:38.454867', '1', 'Booking #1', 2, '[]', 6, 1),
(19, '2026-07-09 10:42:34.553777', '2', 'Booking #2', 1, '[{"added": {}}]', 6, 1),
(20, '2026-07-09 17:17:41.407710', '4', 'Booking #4', 1, '[{"added": {}}]', 6, 1),
(21, '2026-07-09 17:21:41.268822', '4', 'Booking #4', 2, '[]', 6, 1),
(22, '2026-07-09 17:22:10.444762', '5', 'Booking #5', 1, '[{"added": {}}]', 6, 1),
(23, '2026-07-09 17:22:30.007145', '5', 'Booking #5', 2, '[{"changed": {"fields": ["Booking status"]}}]', 6, 1),
(24, '2026-07-09 17:22:37.372887', '5', 'Booking #5', 2, '[{"changed": {"fields": ["Is qr used"]}}]', 6, 1),
(25, '2026-07-09 17:22:55.101003', '5', 'Booking #5', 2, '[{"changed": {"fields": ["Booking status", "Is qr used"]}}]', 6, 1),
(26, '2026-07-09 17:26:33.188864', '6', 'Booking #6', 1, '[{"added": {}}]', 6, 1),
(27, '2026-07-09 17:45:05.089260', '1', 'TORENT EV - AC-Fast', 2, '[{"changed": {"fields": ["Status"]}}]', 7, 1),
(28, '2026-07-09 18:09:29.602489', '1', 'TORENT EV - AC-Fast', 2, '[{"changed": {"fields": ["Status"]}}]', 7, 1),
(29, '2026-07-09 18:24:11.260780', '2', 'Session #2', 2, '[{"changed": {"fields": ["Session status"]}}]', 8, 1),
(30, '2026-07-09 19:02:12.864392', '1', 'Payment #1 - PENDING', 2, '[{"changed": {"fields": ["Charging session"]}}]', 10, 1),
(31, '2026-07-11 10:52:07.005122', '1', 'TORENT EV', 2, '[{"changed": {"fields": ["Latitude", "Longitude"]}}]', 12, 1),
(32, '2026-07-24 19:26:02.971529', '12', 'TanayDesai', 1, '[{"added": {}}]', 14, 1);

-- Table structure for table `django_content_type`
DROP TABLE IF EXISTS `django_content_type`;
CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=19 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `django_content_type`
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

-- Table structure for table `django_migrations`
DROP TABLE IF EXISTS `django_migrations`;
CREATE TABLE `django_migrations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `django_migrations`
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
(39, 'authtoken', '0001_initial', '2026-07-19 06:51:34.633109'),
(40, 'authtoken', '0002_auto_20160226_1747', '2026-07-19 06:51:34.664213'),
(41, 'authtoken', '0003_tokenproxy', '2026-07-19 06:51:34.676405'),
(42, 'authtoken', '0004_alter_tokenproxy_options', '2026-07-19 06:51:34.682912'),
(43, 'bookings', '0004_booking_qr_image_alter_booking_qr_code', '2026-07-24 19:52:52.421251');

-- Table structure for table `django_session`
DROP TABLE IF EXISTS `django_session`;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `django_session`
INSERT INTO `django_session` (`session_key`, `session_data`, `expire_date`) VALUES
('0zuegwmkiob0tl5rls15qdvoez2sf1yo', '.eJxVjDsOwjAQBe_iGln-xR9Kes5grddrHEC2FCcV4u4QKQW0b2bei0XY1hq3QUucMzszyU6_WwJ8UNtBvkO7dY69rcuc-K7wgw5-7Zmel8P9O6gw6rdGtAEdgE9eeaUMGC8UOsKQJ0hUhNTagkzgKCkrQeQSJo-oTCBtC7L3B_d_OIk:1wl2SS:O5Y8hZZ1Q0hpce0Y-vOG0NZLxJ0js88exDvTcT0r7JI', '2026-08-01 10:39:48.575583'),
('8htgz9q0bzk13zhjcbbu2j2vq3iskmwq', '.eJxVjDsOwjAQBe_iGln-xR9Kes5grddrHEC2FCcV4u4QKQW0b2bei0XY1hq3QUucMzszyU6_WwJ8UNtBvkO7dY69rcuc-K7wgw5-7Zmel8P9O6gw6rdGtAEdgE9eeaUMGC8UOsKQJ0hUhNTagkzgKCkrQeQSJo-oTCBtC7L3B_d_OIk:1wnLTQ:lWphMoaxsC4aKIl1w1LORhYzeIT2n5iQIi8NAfJze5U', '2026-08-07 19:22:20.610686'),
('fgdq2p8ifhqu1ydcpfwpdqhot40bgrgn', '.eJxVjDsOwjAQBe_iGln-xR9Kes5grddrHEC2FCcV4u4QKQW0b2bei0XY1hq3QUucMzszyU6_WwJ8UNtBvkO7dY69rcuc-K7wgw5-7Zmel8P9O6gw6rdGtAEdgE9eeaUMGC8UOsKQJ0hUhNTagkzgKCkrQeQSJo-oTCBtC7L3B_d_OIk:1wl2SZ:hH0bhGv1Q3wiK5tfLkE8rLGuvebDv8YUzfdRbCeL1hg', '2026-08-01 10:39:55.097731'),
('j1wxkcv7d298plhmvm871r8hcd957bvl', '.eJxVjMsOgjAQRf-la9MUBqHj0j3fQOZVixpIKKyM_64kLHR7zzn35Qba1jxsxZZhVHdxlTv9bkzysGkHeqfpNnuZp3UZ2e-KP2jx_az2vB7u30Gmkr91G5KyKFJXC0k0OcckGCuurQPBxgIrYEClrm2RIaQEdSAwYBDCxr0_EwY4xA:1wgmv3:xMalOLW5ZUTm6tv2sP37FVVk8s--AUBoIp_i2MwME1M', '2026-07-20 17:15:45.201877'),
('r6yckj7wwbo1ghc1rsaxdyl0hbvy660a', '.eJxVjMsOgjAQRf-la9MUBqHj0j3fQOZVixpIKKyM_64kLHR7zzn35Qba1jxsxZZhVHdxlTv9bkzysGkHeqfpNnuZp3UZ2e-KP2jx_az2vB7u30Gmkr91G5KyKFJXC0k0OcckGCuurQPBxgIrYEClrm2RIaQEdSAwYBDCxr0_EwY4xA:1whWLc:Qn6JPHAULKYxzcm0Lz2D7ZX3UNtw84dcRSea_RB9rXM', '2026-07-22 17:46:12.897988');

-- Table structure for table `favorites_favoritestation`
DROP TABLE IF EXISTS `favorites_favoritestation`;
CREATE TABLE `favorites_favoritestation` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `created_at` datetime(6) NOT NULL,
  `station_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `favorites_favoritestation_user_id_station_id_8ed884b1_uniq` (`user_id`,`station_id`),
  KEY `favorites_favoritest_station_id_6e6642a1_fk_stations_` (`station_id`),
  CONSTRAINT `favorites_favoritest_station_id_6e6642a1_fk_stations_` FOREIGN KEY (`station_id`) REFERENCES `stations_station` (`id`),
  CONSTRAINT `favorites_favoritestation_user_id_f92aca6c_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `notifications_notification`
DROP TABLE IF EXISTS `notifications_notification`;
CREATE TABLE `notifications_notification` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `title` varchar(100) NOT NULL,
  `message` longtext NOT NULL,
  `notification_type` varchar(20) NOT NULL,
  `is_read` tinyint(1) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `notifications_notification_user_id_b5e8c0ff_fk_users_user_id` (`user_id`),
  CONSTRAINT `notifications_notification_user_id_b5e8c0ff_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=44 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `notifications_notification`
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
(25, 'Charging Completed', 'Charging completed successfully.
Energy: 6.000 kWh
Cost: ₹78.00000', 'CHARGING', 1, '2026-07-10 10:54:16.639564', 2),
(26, 'Payment Success', 'Payment of ₹241.80 was successful (Transaction: TXN-478BD9F8C9).', 'PAYMENT', 0, '2026-07-19 07:12:44.545272', 2),
(28, 'Charging Session Started', 'Charging session #6 has started for vehicle BMW ix. Current battery: 99.00%.', 'CHARGING', 0, '2026-07-19 09:47:59.069179', 2),
(29, 'Charging Started', 'Charging has started on AC-Fast.', 'CHARGING', 0, '2026-07-19 09:47:59.073816', 2),
(30, 'Payment Success', 'Payment of ₹78.00 was successful (Transaction: TXN-268A9BBCE0).', 'PAYMENT', 0, '2026-07-23 14:35:11.287993', 2),
(31, 'Charging Session Completed', 'Charging session #6 completed. Battery charged to 100%. Energy consumed: 0.6000 kWh. Total cost: ₹7.800000.', 'CHARGING', 0, '2026-07-23 16:45:44.270559', 2),
(32, 'Payment Pending', 'Payment of ₹7.800000 failed (Transaction: TXN-8D9A96C193).', 'PAYMENT', 0, '2026-07-23 16:45:44.304210', 2),
(33, 'Charging Completed', 'Charging completed. Energy: 0.60 kWh, Cost: ₹7.80', 'CHARGING', 0, '2026-07-23 16:45:44.307022', 2),
(34, 'Payment Success', 'Payment of ₹7.80 was successful (Transaction: TXN-9D7EAF6FBD).', 'PAYMENT', 0, '2026-07-23 16:46:00.916994', 2),
(35, 'Booking Confirmed', 'Your booking #11 at TORENT EV for charger AC-Fast is confirmed on 2026-07-25 from 10:00:00 to 11:00:00.', 'BOOKING', 0, '2026-07-24 19:20:52.820381', 2),
(36, 'Booking Confirmed', 'Your booking at TORENT EV has been confirmed.', 'BOOKING', 0, '2026-07-24 19:20:52.891162', 2),
(37, 'QR Verified', 'Your QR code has been verified. You can now start charging.', 'BOOKING', 0, '2026-07-24 20:40:49.449311', 2),
(38, 'Charging Session Started', 'Charging session #7 has started for vehicle BMW ix. Current battery: 40.00%.', 'CHARGING', 0, '2026-07-24 20:40:57.194425', 2),
(39, 'Charging Started', 'Charging has started on AC-Fast.', 'CHARGING', 0, '2026-07-24 20:40:57.198311', 2),
(40, 'Charging Session Completed', 'Charging session #7 completed. Battery charged to 95.45%. Energy consumed: 33.27 kWh. Total cost: ₹432.48.', 'CHARGING', 0, '2026-07-24 21:22:44.367853', 2),
(41, 'Payment Pending', 'Payment of ₹432.48 failed (Transaction: TXN-E2F09B6214).', 'PAYMENT', 0, '2026-07-24 21:22:44.378387', 2),
(42, 'Charging Completed', 'Charging completed. Energy: 33.27 kWh, Cost: ₹432.48', 'CHARGING', 0, '2026-07-24 21:22:44.379325', 2),
(43, 'Payment Success', 'Payment of ₹432.48 was successful (Transaction: TXN-A7DB880D27).', 'PAYMENT', 0, '2026-07-24 21:24:05.746730', 2);

-- Table structure for table `payments_payment`
DROP TABLE IF EXISTS `payments_payment`;
CREATE TABLE `payments_payment` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `amount` decimal(10,2) NOT NULL,
  `payment_method` varchar(20) DEFAULT NULL,
  `transaction_id` varchar(100) DEFAULT NULL,
  `payment_status` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  `charging_session_id` bigint(20) DEFAULT NULL,
  `paid_at` datetime(6) DEFAULT NULL,
  `payment_otp` varchar(6) DEFAULT NULL,
  `otp_sent_at` datetime(6) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `charging_session_id` (`charging_session_id`),
  KEY `payments_payment_user_id_f9db060a_fk_users_user_id` (`user_id`),
  CONSTRAINT `payments_payment_charging_session_id_55a13d16_fk_charging_` FOREIGN KEY (`charging_session_id`) REFERENCES `charging_chargingsession` (`id`),
  CONSTRAINT `payments_payment_user_id_f9db060a_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `payments_payment`
INSERT INTO `payments_payment` (`id`, `amount`, `payment_method`, `transaction_id`, `payment_status`, `created_at`, `user_id`, `charging_session_id`, `paid_at`, `payment_otp`, `otp_sent_at`) VALUES
(1, '546.00', 'UPI', 'TXN-90A7B3573F', 'SUCCESS', '2026-07-07 19:13:39.654837', 2, 1, '2026-07-09 19:22:36.079638', NULL, NULL),
(2, '241.80', 'UPI', 'TXN-478BD9F8C9', 'SUCCESS', '2026-07-09 17:10:37.861699', 2, NULL, '2026-07-19 07:12:44.534558', NULL, NULL),
(3, '78.00', 'UPI', 'TXN-268A9BBCE0', 'SUCCESS', '2026-07-10 10:54:16.642489', 2, 5, '2026-07-23 14:35:11.249001', NULL, NULL),
(4, '7.80', 'UPI', 'TXN-9D7EAF6FBD', 'SUCCESS', '2026-07-23 16:45:44.298242', 2, 6, '2026-07-23 16:46:00.869401', NULL, NULL),
(5, '432.48', 'CASH', 'TXN-A7DB880D27', 'SUCCESS', '2026-07-24 21:22:44.376307', 2, 7, '2026-07-24 21:24:05.698112', NULL, NULL);

-- Table structure for table `reviews_review`
DROP TABLE IF EXISTS `reviews_review`;
CREATE TABLE `reviews_review` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `rating` smallint(5) unsigned NOT NULL CHECK (`rating` >= 0),
  `comment` longtext DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `updated_at` datetime(6) NOT NULL,
  `station_id` bigint(20) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `reviews_review_user_id_station_id_e40e2820_uniq` (`user_id`,`station_id`),
  KEY `reviews_review_station_id_87b2e205_fk_stations_station_id` (`station_id`),
  CONSTRAINT `reviews_review_station_id_87b2e205_fk_stations_station_id` FOREIGN KEY (`station_id`) REFERENCES `stations_station` (`id`),
  CONSTRAINT `reviews_review_user_id_875caff2_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `reviews_review`
INSERT INTO `reviews_review` (`id`, `rating`, `comment`, `created_at`, `updated_at`, `station_id`, `user_id`) VALUES
(1, 5, 'Excellent charging station.', '2026-07-08 17:49:31.173403', '2026-07-08 17:49:31.173421', 1, 2);

-- Table structure for table `stations_station`
DROP TABLE IF EXISTS `stations_station`;
CREATE TABLE `stations_station` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `station_name` varchar(100) NOT NULL,
  `address` longtext NOT NULL,
  `city` varchar(50) NOT NULL,
  `state` varchar(50) NOT NULL,
  `pincode` varchar(10) NOT NULL,
  `latitude` decimal(10,7) NOT NULL,
  `longitude` decimal(10,7) NOT NULL,
  `opening_time` time(6) NOT NULL,
  `closing_time` time(6) NOT NULL,
  `contact_number` varchar(15) NOT NULL,
  `email` varchar(254) NOT NULL,
  `amenities` longtext DEFAULT NULL,
  `rating` decimal(2,1) NOT NULL,
  `status` varchar(20) NOT NULL,
  `created_at` datetime(6) NOT NULL,
  `operator_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  KEY `stations_station_operator_id_42920f79_fk_users_user_id` (`operator_id`),
  CONSTRAINT `stations_station_operator_id_42920f79_fk_users_user_id` FOREIGN KEY (`operator_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=206 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `stations_station`
INSERT INTO `stations_station` (`id`, `station_name`, `address`, `city`, `state`, `pincode`, `latitude`, `longitude`, `opening_time`, `closing_time`, `contact_number`, `email`, `amenities`, `rating`, `status`, `created_at`, `operator_id`) VALUES
(1, 'TORENT EV', '13/156 gokul apt,parasnagar, sola road ,ahmedabad', 'Ahmedabad', 'Gujarat', '380063', '23.0551776', '72.5439939', '06:00:00', '23:29:54', '8959632689', 'desaitanay35@gmail.com', '', '5.0', 'OPEN', '2026-07-06 18:00:17.268733', 5),
(158, 'Zeon Charging Hub - Bhuj Station Road #3', 'Plot 59, Station Road, Bhuj, Gujarat', 'Bhuj', 'Gujarat', '370024', '23.2272833', '69.6385888', '06:00:00', '22:00:00', '9827698983', 'support.bhuj@zeoncharging.com', 'Restroom, Convenience Store', '4.7', 'OPEN', '2026-07-28 10:08:30.149472', 3),
(159, 'Tata Power Hub - Bhuj Airport Road #4', 'Plot 252, Airport Road, Bhuj, Gujarat', 'Bhuj', 'Gujarat', '370069', '23.2277122', '69.6489025', '08:00:00', '23:00:00', '9854542369', 'support.bhuj@tatapower.com', 'Restroom, Food Court Proximity', '4.3', 'OPEN', '2026-07-28 10:08:30.166371', 3),
(160, 'Tata Power Hub - Bhuj College Road #5', 'Plot 192, College Road, Bhuj, Gujarat', 'Bhuj', 'Gujarat', '370089', '23.2712757', '69.6750699', '08:00:00', '22:59:00', '9873656001', 'support.bhuj@tatapower.com', 'Cafeteria, Restroom, Wi-Fi', '3.8', 'OPEN', '2026-07-28 10:08:30.182897', 3),
(161, 'Adani Gas EV Hub - Bhuj Industrial Area Road #6', 'Plot 460, Industrial Area Road, Bhuj, Gujarat', 'Bhuj', 'Gujarat', '370065', '23.2785659', '69.6750080', '08:00:00', '22:59:00', '9865961795', 'support.bhuj@adanigasev.com', 'Food Stall, Restroom', '4.2', 'OPEN', '2026-07-28 10:08:30.203656', 5),
(162, 'Torrent Power Hub - Bhuj Market Street #7', 'Plot 15, Market Street, Bhuj, Gujarat', 'Bhuj', 'Gujarat', '370085', '23.2228367', '69.6475755', '08:00:00', '22:00:00', '9853798588', 'support.bhuj@torrentpower.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', '4.0', 'OPEN', '2026-07-28 10:08:30.224293', 5),
(163, 'Jio-bp Pulse Hub - Bhuj City Center Road #8', 'Plot 89, City Center Road, Bhuj, Gujarat', 'Bhuj', 'Gujarat', '370085', '23.2069698', '69.6362071', '00:00:00', '22:59:00', '9819293083', 'support.bhuj@jiobppulse.com', 'Restroom, Shopping Mall Proximity', '4.6', 'OPEN', '2026-07-28 10:08:30.244420', 3),
(164, 'Tata Power Hub - Bhuj Ring Road #9', 'Plot 59, Ring Road, Bhuj, Gujarat', 'Bhuj', 'Gujarat', '370074', '23.2341581', '69.6935858', '00:00:00', '23:59:00', '9834293839', 'support.bhuj@tatapower.com', 'Restroom, Convenience Store', '4.0', 'OPEN', '2026-07-28 10:08:30.271188', 3),
(165, 'Tata Power Hub - Bhuj College Road #10', 'Plot 87, College Road, Bhuj, Gujarat', 'Bhuj', 'Gujarat', '370023', '23.2791149', '69.6810645', '00:00:00', '23:00:00', '9891575773', 'support.bhuj@tatapower.com', 'Restroom, Supermarket Proximity', '4.2', 'OPEN', '2026-07-28 10:08:30.288730', 3),
(166, 'Adani Gas EV Hub - Gandhidham Market Street #1', 'Plot 340, Market Street, Gandhidham, Gujarat', 'Gandhidham', 'Gujarat', '370244', '23.0860953', '70.1471514', '08:00:00', '22:00:00', '9813933292', 'support.gandhidham@adanigasev.com', 'Restroom, Supermarket Proximity', '3.9', 'OPEN', '2026-07-28 10:08:30.304793', 5),
(167, 'Jio-bp Pulse Hub - Gandhidham Link Road #2', 'Plot 254, Link Road, Gandhidham, Gujarat', 'Gandhidham', 'Gujarat', '370283', '23.1044533', '70.0911070', '00:00:00', '22:00:00', '9840867588', 'support.gandhidham@jiobppulse.com', 'Restroom, Supermarket Proximity', '4.6', 'OPEN', '2026-07-28 10:08:30.323562', 3),
(168, 'Tata Power Hub - Gandhidham Market Street #3', 'Plot 227, Market Street, Gandhidham, Gujarat', 'Gandhidham', 'Gujarat', '370274', '23.0840157', '70.1593385', '00:00:00', '22:59:00', '9848501972', 'support.gandhidham@tatapower.com', 'Cafeteria, Restroom, Wi-Fi', '4.1', 'OPEN', '2026-07-28 10:08:30.347192', 3),
(169, 'Adani Gas EV Hub - Gandhidham GIDC Sector 2 #4', 'Plot 136, GIDC Sector 2, Gandhidham, Gujarat', 'Gandhidham', 'Gujarat', '370260', '23.0947999', '70.1654021', '06:00:00', '23:59:00', '9883702100', 'support.gandhidham@adanigasev.com', 'Cafeteria, Restroom, Wi-Fi', '4.2', 'OPEN', '2026-07-28 10:08:30.366055', 5),
(170, 'Torrent Power Hub - Gandhidham Main Road #5', 'Plot 243, Main Road, Gandhidham, Gujarat', 'Gandhidham', 'Gujarat', '370254', '23.0884620', '70.1332357', '00:00:00', '22:59:00', '9823786975', 'support.gandhidham@torrentpower.com', 'Restroom, Convenience Store', '4.8', 'OPEN', '2026-07-28 10:08:30.390561', 5),
(171, 'Jio-bp Pulse Hub - Gandhidham Market Street #6', 'Plot 457, Market Street, Gandhidham, Gujarat', 'Gandhidham', 'Gujarat', '370222', '23.0549496', '70.1193861', '06:00:00', '22:00:00', '9868829462', 'support.gandhidham@jiobppulse.com', 'Restroom, Shopping Mall Proximity', '4.5', 'OPEN', '2026-07-28 10:08:30.409660', 3),
(172, 'Adani Gas EV Hub - Gandhidham Industrial Area Road #7', 'Plot 376, Industrial Area Road, Gandhidham, Gujarat', 'Gandhidham', 'Gujarat', '370218', '23.1082161', '70.1332455', '00:00:00', '23:59:00', '9884616678', 'support.gandhidham@adanigasev.com', 'Food Stall, Restroom', '3.9', 'OPEN', '2026-07-28 10:08:30.428753', 5),
(173, 'Tata Power Hub - Gandhidham Station Road #8', 'Plot 423, Station Road, Gandhidham, Gujarat', 'Gandhidham', 'Gujarat', '370276', '23.0719092', '70.1272070', '06:00:00', '22:00:00', '9827882574', 'support.gandhidham@tatapower.com', 'Restroom, Coffee Shop', '4.2', 'OPEN', '2026-07-28 10:08:30.447520', 3),
(174, 'Tata Power Hub - Gandhidham Airport Road #9', 'Plot 352, Airport Road, Gandhidham, Gujarat', 'Gandhidham', 'Gujarat', '370210', '23.0725850', '70.1635395', '00:00:00', '23:59:00', '9866916321', 'support.gandhidham@tatapower.com', 'Restroom, Food Court Proximity', '4.0', 'OPEN', '2026-07-28 10:08:30.466411', 3),
(175, 'Zeon Charging Hub - Gandhidham VIP Road #10', 'Plot 332, VIP Road, Gandhidham, Gujarat', 'Gandhidham', 'Gujarat', '370259', '23.0715303', '70.1358713', '00:00:00', '22:59:00', '9860949262', 'support.gandhidham@zeoncharging.com', 'Restroom, Coffee Shop', '4.7', 'OPEN', '2026-07-28 10:08:30.489134', 3),
(176, 'Jio-bp Pulse Hub - Porbandar Station Road #1', 'Plot 173, Station Road, Porbandar, Gujarat', 'Porbandar', 'Gujarat', '360568', '21.6117419', '69.6318931', '06:00:00', '22:59:00', '9850364193', 'support.porbandar@jiobppulse.com', 'Restroom, Supermarket Proximity', '4.8', 'OPEN', '2026-07-28 10:08:30.517567', 3),
(177, 'Torrent Power Hub - Porbandar Industrial Area Road #2', 'Plot 408, Industrial Area Road, Porbandar, Gujarat', 'Porbandar', 'Gujarat', '360598', '21.6319565', '69.6143300', '00:00:00', '23:00:00', '9839913053', 'support.porbandar@torrentpower.com', 'Restroom, Coffee Shop', '4.9', 'OPEN', '2026-07-28 10:08:30.540634', 5),
(178, 'Torrent Power Hub - Porbandar Airport Road #3', 'Plot 454, Airport Road, Porbandar, Gujarat', 'Porbandar', 'Gujarat', '360588', '21.6120946', '69.5782040', '08:00:00', '22:00:00', '9835708524', 'support.porbandar@torrentpower.com', 'Restroom, Convenience Store', '4.4', 'OPEN', '2026-07-28 10:08:30.554372', 5),
(179, 'Torrent Power Hub - Porbandar Link Road #4', 'Plot 24, Link Road, Porbandar, Gujarat', 'Porbandar', 'Gujarat', '360526', '21.6758330', '69.5916992', '08:00:00', '23:59:00', '9879111530', 'support.porbandar@torrentpower.com', 'Restroom, Convenience Store', '4.8', 'OPEN', '2026-07-28 10:08:30.567539', 5),
(180, 'Zeon Charging Hub - Porbandar Station Road #5', 'Plot 262, Station Road, Porbandar, Gujarat', 'Porbandar', 'Gujarat', '360558', '21.6172882', '69.6212747', '08:00:00', '22:00:00', '9853579919', 'support.porbandar@zeoncharging.com', 'Food Stall, Restroom', '4.7', 'OPEN', '2026-07-28 10:08:30.595029', 3),
(181, 'Jio-bp Pulse Hub - Porbandar VIP Road #6', 'Plot 61, VIP Road, Porbandar, Gujarat', 'Porbandar', 'Gujarat', '360595', '21.6275421', '69.6366501', '08:00:00', '22:59:00', '9849234760', 'support.porbandar@jiobppulse.com', 'Restroom, Supermarket Proximity', '3.9', 'OPEN', '2026-07-28 10:08:30.613737', 3),
(182, 'Zeon Charging Hub - Porbandar Industrial Area Road #7', 'Plot 357, Industrial Area Road, Porbandar, Gujarat', 'Porbandar', 'Gujarat', '360546', '21.6114228', '69.6074560', '06:00:00', '22:59:00', '9813700656', 'support.porbandar@zeoncharging.com', 'Restroom, Convenience Store', '4.5', 'OPEN', '2026-07-28 10:08:30.628709', 3),
(183, 'Tata Power Hub - Porbandar Industrial Area Road #8', 'Plot 67, Industrial Area Road, Porbandar, Gujarat', 'Porbandar', 'Gujarat', '360541', '21.6419755', '69.6380023', '00:00:00', '23:59:00', '9848264199', 'support.porbandar@tatapower.com', 'Restroom, Coffee Shop', '4.2', 'OPEN', '2026-07-28 10:08:30.648580', 3),
(184, 'Torrent Power Hub - Porbandar Link Road #9', 'Plot 228, Link Road, Porbandar, Gujarat', 'Porbandar', 'Gujarat', '360540', '21.6487334', '69.6449014', '06:00:00', '23:59:00', '9887016232', 'support.porbandar@torrentpower.com', 'Food Stall, Restroom', '4.6', 'OPEN', '2026-07-28 10:08:30.677721', 5),
(185, 'Jio-bp Pulse Hub - Porbandar Industrial Area Road #10', 'Plot 495, Industrial Area Road, Porbandar, Gujarat', 'Porbandar', 'Gujarat', '360550', '21.6617013', '69.5931166', '06:00:00', '22:59:00', '9854505841', 'support.porbandar@jiobppulse.com', 'Cafeteria, Restroom, Wi-Fi', '4.8', 'OPEN', '2026-07-28 10:08:30.696600', 3),
(186, 'Adani Gas EV Hub - Veraval Ring Road #1', 'Plot 55, Ring Road, Veraval, Gujarat', 'Veraval', 'Gujarat', '362298', '20.8770539', '70.3821457', '00:00:00', '23:59:00', '9897462594', 'support.veraval@adanigasev.com', 'Food Stall, Restroom', '4.4', 'OPEN', '2026-07-28 10:08:30.724376', 5),
(187, 'Zeon Charging Hub - Veraval Market Street #2', 'Plot 456, Market Street, Veraval, Gujarat', 'Veraval', 'Gujarat', '362269', '20.9069019', '70.3407290', '06:00:00', '23:59:00', '9879221573', 'support.veraval@zeoncharging.com', 'Cafeteria, Restroom, Wi-Fi', '4.1', 'OPEN', '2026-07-28 10:08:30.735595', 3),
(188, 'Torrent Power Hub - Veraval Link Road #3', 'Plot 383, Link Road, Veraval, Gujarat', 'Veraval', 'Gujarat', '362268', '20.9504145', '70.3369610', '08:00:00', '22:59:00', '9892547892', 'support.veraval@torrentpower.com', 'Cafeteria, Restroom, Wi-Fi', '4.1', 'OPEN', '2026-07-28 10:08:30.758455', 5),
(189, 'Zeon Charging Hub - Veraval Airport Road #4', 'Plot 415, Airport Road, Veraval, Gujarat', 'Veraval', 'Gujarat', '362252', '20.8822190', '70.3839459', '08:00:00', '23:59:00', '9896066639', 'support.veraval@zeoncharging.com', 'Restroom, Food Court Proximity', '4.6', 'OPEN', '2026-07-28 10:08:30.780488', 3),
(190, 'Jio-bp Pulse Hub - Veraval Link Road #5', 'Plot 232, Link Road, Veraval, Gujarat', 'Veraval', 'Gujarat', '362244', '20.9172934', '70.3584859', '06:00:00', '22:00:00', '9841010341', 'support.veraval@jiobppulse.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', '4.7', 'OPEN', '2026-07-28 10:08:30.795233', 3),
(191, 'Tata Power Hub - Veraval City Center Road #6', 'Plot 126, City Center Road, Veraval, Gujarat', 'Veraval', 'Gujarat', '362270', '20.9189151', '70.3837595', '00:00:00', '22:00:00', '9812844458', 'support.veraval@tatapower.com', 'Restroom, Supermarket Proximity', '4.0', 'OPEN', '2026-07-28 10:08:30.810201', 3),
(192, 'Zeon Charging Hub - Veraval Station Road #7', 'Plot 392, Station Road, Veraval, Gujarat', 'Veraval', 'Gujarat', '362296', '20.9549063', '70.3333997', '00:00:00', '22:00:00', '9846328166', 'support.veraval@zeoncharging.com', 'Cafeteria, Restroom, Wi-Fi', '4.2', 'OPEN', '2026-07-28 10:08:30.837811', 3),
(193, 'Tata Power Hub - Veraval Station Road #8', 'Plot 92, Station Road, Veraval, Gujarat', 'Veraval', 'Gujarat', '362223', '20.9472601', '70.3658476', '08:00:00', '23:00:00', '9874691135', 'support.veraval@tatapower.com', 'Restroom, Convenience Store', '4.6', 'OPEN', '2026-07-28 10:08:30.870802', 3),
(194, 'Adani Gas EV Hub - Veraval GIDC Sector 2 #9', 'Plot 308, GIDC Sector 2, Veraval, Gujarat', 'Veraval', 'Gujarat', '362236', '20.8769029', '70.3422453', '08:00:00', '22:00:00', '9832119507', 'support.veraval@adanigasev.com', 'Restroom, Food Court Proximity', '4.1', 'OPEN', '2026-07-28 10:08:30.899239', 5),
(195, 'Torrent Power Hub - Veraval GIDC Sector 2 #10', 'Plot 494, GIDC Sector 2, Veraval, Gujarat', 'Veraval', 'Gujarat', '362298', '20.9346779', '70.3956783', '00:00:00', '22:00:00', '9836663975', 'support.veraval@torrentpower.com', 'Restroom, Coffee Shop', '4.9', 'OPEN', '2026-07-28 10:08:30.917382', 5),
(196, 'Jio-bp Pulse Hub - Godhra Ring Road #1', 'Plot 483, Ring Road, Godhra, Gujarat', 'Godhra', 'Gujarat', '389086', '22.7481613', '73.6523638', '08:00:00', '23:59:00', '9847201733', 'support.godhra@jiobppulse.com', 'Restroom, Food Court Proximity', '4.0', 'OPEN', '2026-07-28 10:08:30.934969', 3),
(197, 'Torrent Power Hub - Godhra Highway 48 Bypass #2', 'Plot 230, Highway 48 Bypass, Godhra, Gujarat', 'Godhra', 'Gujarat', '389041', '22.8076980', '73.5962677', '06:00:00', '23:59:00', '9812181553', 'support.godhra@torrentpower.com', 'Restroom, Food Court Proximity', '3.8', 'OPEN', '2026-07-28 10:08:30.957594', 5),
(198, 'Adani Gas EV Hub - Godhra College Road #3', 'Plot 472, College Road, Godhra, Gujarat', 'Godhra', 'Gujarat', '389081', '22.7663863', '73.6230231', '06:00:00', '22:59:00', '9863997403', 'support.godhra@adanigasev.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', '4.8', 'OPEN', '2026-07-28 10:08:30.971104', 5),
(199, 'Jio-bp Pulse Hub - Godhra City Center Road #4', 'Plot 343, City Center Road, Godhra, Gujarat', 'Godhra', 'Gujarat', '389043', '22.8083542', '73.6434941', '00:00:00', '23:59:00', '9892860043', 'support.godhra@jiobppulse.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', '4.4', 'OPEN', '2026-07-28 10:08:30.993293', 3),
(200, 'Jio-bp Pulse Hub - Godhra Industrial Area Road #5', 'Plot 402, Industrial Area Road, Godhra, Gujarat', 'Godhra', 'Gujarat', '389021', '22.7397601', '73.6542131', '08:00:00', '22:00:00', '9899631240', 'support.godhra@jiobppulse.com', 'Restroom, Supermarket Proximity', '4.7', 'OPEN', '2026-07-28 10:08:31.021310', 3),
(201, 'Torrent Power Hub - Godhra Highway 48 Bypass #6', 'Plot 42, Highway 48 Bypass, Godhra, Gujarat', 'Godhra', 'Gujarat', '389038', '22.8078769', '73.6455113', '00:00:00', '22:59:00', '9876072321', 'support.godhra@torrentpower.com', 'Restroom, Shopping Mall Proximity', '4.7', 'OPEN', '2026-07-28 10:08:31.048011', 5),
(202, 'Zeon Charging Hub - Godhra City Center Road #7', 'Plot 133, City Center Road, Godhra, Gujarat', 'Godhra', 'Gujarat', '389088', '22.7580172', '73.6129210', '08:00:00', '22:59:00', '9825214236', 'support.godhra@zeoncharging.com', 'Waiting Lounge, Coffee Shop, Kids Play Area', '3.9', 'OPEN', '2026-07-28 10:08:31.061484', 3),
(203, 'Zeon Charging Hub - Godhra Industrial Area Road #8', 'Plot 354, Industrial Area Road, Godhra, Gujarat', 'Godhra', 'Gujarat', '389014', '22.7693539', '73.6339462', '08:00:00', '22:59:00', '9854421731', 'support.godhra@zeoncharging.com', 'Cafeteria, Restroom, Wi-Fi', '4.1', 'OPEN', '2026-07-28 10:08:31.075989', 3),
(204, 'Adani Gas EV Hub - Godhra Main Road #9', 'Plot 273, Main Road, Godhra, Gujarat', 'Godhra', 'Gujarat', '389038', '22.7458427', '73.6260076', '08:00:00', '22:59:00', '9835112570', 'support.godhra@adanigasev.com', 'Restroom, Coffee Shop', '3.8', 'OPEN', '2026-07-28 10:08:31.091161', 5),
(205, 'Jio-bp Pulse Hub - Godhra Link Road #10', 'Plot 312, Link Road, Godhra, Gujarat', 'Godhra', 'Gujarat', '389078', '22.7657605', '73.5882235', '06:00:00', '22:59:00', '9838415980', 'support.godhra@jiobppulse.com', 'Restroom, Convenience Store', '4.7', 'OPEN', '2026-07-28 10:08:31.119998', 3);

-- Table structure for table `trips_trip`
DROP TABLE IF EXISTS `trips_trip`;
CREATE TABLE `trips_trip` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `source` varchar(200) NOT NULL,
  `distance_km` decimal(8,2) NOT NULL,
  `estimated_time` int(10) unsigned NOT NULL CHECK (`estimated_time` >= 0),
  `estimated_battery_needed` decimal(5,2) NOT NULL,
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
  PRIMARY KEY (`id`),
  KEY `trips_trip_suggested_station_id_ffeb346b_fk_stations_station_id` (`suggested_station_id`),
  KEY `trips_trip_user_id_b33c249a_fk_users_user_id` (`user_id`),
  KEY `trips_trip_vehicle_id_e21456ae_fk_vehicles_vehicle_id` (`vehicle_id`),
  CONSTRAINT `trips_trip_suggested_station_id_ffeb346b_fk_stations_station_id` FOREIGN KEY (`suggested_station_id`) REFERENCES `stations_station` (`id`),
  CONSTRAINT `trips_trip_user_id_b33c249a_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`),
  CONSTRAINT `trips_trip_vehicle_id_e21456ae_fk_vehicles_vehicle_id` FOREIGN KEY (`vehicle_id`) REFERENCES `vehicles_vehicle` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=18 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `trips_trip`
INSERT INTO `trips_trip` (`id`, `source`, `distance_km`, `estimated_time`, `estimated_battery_needed`, `trip_status`, `start_time`, `end_time`, `created_at`, `suggested_station_id`, `user_id`, `vehicle_id`, `destination_latitude`, `destination_longitude`, `source_latitude`, `source_longitude`, `destination`) VALUES
(4, 'Surat', '290.00', 300, '89.00', 'PLANNED', '2026-07-06 18:12:37', '2026-07-07 00:30:00', '2026-07-06 18:12:50.076497', 1, 2, 1, '24.8956890', '24.5689740', '23.5689450', '23.5689750', 'Ahmedabad'),
(5, 'Ahmedabad', '251.72', 174, '80.00', 'PLANNED', NULL, NULL, '2026-07-10 07:43:58.531142', 1, 2, 1, NULL, NULL, NULL, NULL, 'Surat'),
(6, 'Current Location', '5.00', 15, '2.08', 'PLANNED', NULL, NULL, '2026-07-11 10:42:51.990054', 1, 2, 1, '27.8005545', '28.8777980', '27.8005545', '28.8777980', 'TORENT EV'),
(7, 'Current Location', '5.00', 15, '2.08', 'PLANNED', NULL, NULL, '2026-07-11 11:28:53.971316', 1, 2, 1, '23.0551776', '72.5439939', '23.0551776', '72.5439939', 'TORENT EV'),
(8, 'Current Location', '5.00', 15, '2.08', 'PLANNED', NULL, NULL, '2026-07-11 11:28:57.219733', 1, 2, 1, '23.0551776', '72.5439939', '23.0551776', '72.5439939', 'TORENT EV'),
(10, 'Ahmedabas', '290.00', 360, '99.00', 'PLANNED', NULL, NULL, '2026-07-19 07:14:05.433634', NULL, 2, 1, NULL, NULL, NULL, NULL, 'Surat'),
(12, 'Ahmedabad', '150.00', 145, '36.00', 'PLANNED', NULL, NULL, '2026-07-19 08:03:39.640948', NULL, 10, 4, NULL, NULL, NULL, NULL, 'Vadodra'),
(13, 'Ahmedabad', '150.00', 145, '36.00', 'PLANNED', NULL, NULL, '2026-07-19 08:03:48.065287', NULL, 10, 4, NULL, NULL, NULL, NULL, 'Vadodra'),
(14, 'Surat', '290.00', 360, '99.00', 'PLANNED', NULL, NULL, '2026-07-19 10:34:08.820129', NULL, 2, 1, NULL, NULL, NULL, NULL, 'Ahmedabad'),
(15, 'Surat', '290.00', 360, '100.00', 'PLANNED', NULL, NULL, '2026-07-23 17:55:38.444435', NULL, 2, 1, NULL, NULL, NULL, NULL, 'Ahmedabad'),
(16, 'Surat', '290.00', 360, '40.00', 'PLANNED', NULL, NULL, '2026-07-24 17:22:06.585927', NULL, 2, 1, NULL, NULL, NULL, NULL, 'Ahmedabad'),
(17, 'Surat', '290.00', 360, '40.00', 'PLANNED', NULL, NULL, '2026-07-24 17:36:52.615955', NULL, 2, 1, NULL, NULL, NULL, NULL, 'Ahmedabad');

-- Table structure for table `users_user`
DROP TABLE IF EXISTS `users_user`;
CREATE TABLE `users_user` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
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
  `is_verified` tinyint(1) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `username` (`username`),
  UNIQUE KEY `phone` (`phone`)
) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `users_user`
INSERT INTO `users_user` (`id`, `password`, `last_login`, `is_superuser`, `username`, `first_name`, `last_name`, `email`, `is_staff`, `is_active`, `date_joined`, `role`, `phone`, `profile_image`, `address`, `city`, `state`, `pincode`, `is_verified`) VALUES
(1, 'pbkdf2_sha256$1200000$JX8F6pu6193ppotcvsSJ1a$qrfLIMM8l6PUUQX6C7JdUyJakM+sU22VNmzriA4wB+4=', '2026-07-24 19:22:20.607348', 1, 'evchargex', '', '', 'desaitanay35@gmail.com', 1, 1, '2026-07-06 17:14:31', 'ADMIN', NULL, '', '', NULL, NULL, NULL, 0),
(2, 'pbkdf2_sha256$1200000$ZaAklutPpO4ou2tGJyhcsB$mjMND+GlSn9zlt5bXhV00+nHT1YB5xXhr1rpIauUccM=', '2026-07-06 17:47:43', 0, 'Tanay', 'Tanay', 'Desai', 'desaitanay35@gmail.com', 0, 1, '2026-07-06 17:47:28', 'USER', '6352916072', '', '13/156 gokul apt,parasnagar, sola road ,ahmedabad', 'Ahmedabad', 'Gujarat', '380063', 0),
(3, 'pbkdf2_sha256$600000$k7MfdRzdu1y8qAbwuf7NRH$ciQftv8o4chM+FtGN53sJJF+AjkIlqy+R2eq9VJxKnw=', '2026-07-06 17:59:05', 0, 'TATA', 'Tanay', 'Desai', 'desaitanay83@gmail.com', 0, 1, '2026-07-06 17:58:47', 'OPERATOR', '6352916089', '', '13/156 gokul apt,parasnagar, sola road ,ahmedabad', 'Ahmedabad', 'Gujarat', '380063', 0),
(4, 'pbkdf2_sha256$600000$0GRB64a6vdq0ibL1hOKYo9$+owW1DNFjolMlfum0YGkhZ4wqjVkcQqhjA3/8q/r6eg=', NULL, 0, 'testuser', '', '', 'testuser@example.com', 0, 1, '2026-07-07 17:50:10.257500', 'USER', '9876543210', '', '123 Test Street', 'Ahmedabad', 'Gujarat', '380009', 0),
(5, 'pbkdf2_sha256$1200000$GofvK44PZkNVghHwyIecjp$6B5MQ0Q/sWgJLYBtVMhitW5ATYU0FL36VnfaHj+cKng=', '2026-07-09 10:17:35', 0, 'Torent', 'Tanay', 'Desai', 'desai@gmail.com', 0, 1, '2026-07-09 10:17:07', 'OPERATOR', '8956237415', '', '13/155,Gokul appertment, Sola Road,naranpura', 'Ahmedabad', 'Gujarat', '380063', 0),
(6, 'pbkdf2_sha256$600000$6zGAMDk0YQTy1fTf7iUxM0$i4z06xoBUsHhzzsjVmCRr31ERDN9bhkb9oa0K5G3tp4=', NULL, 0, 'newuser@example.com', 'Test', 'UserNew', 'newuser@example.com', 0, 1, '2026-07-19 06:58:55.698151', 'USER', '9999999999', '', NULL, NULL, NULL, NULL, 0),
(7, 'pbkdf2_sha256$600000$nB5NrjLNuXnHO64iCqznCB$9UAUZVZ6/hshP8wOQXFnk8Yg4KGeXHli19HMzBW+Ka4=', NULL, 0, 'integration@example.com', 'Integration', 'Test', 'integration@example.com', 0, 1, '2026-07-19 06:59:25.423649', 'USER', '8888888888', '', NULL, NULL, NULL, NULL, 0),
(10, 'pbkdf2_sha256$1200000$X0G7cD7O6JHEJCos2YJcJT$Cq4STGsk+KJuyb1svAFSwnu8+vCryaattTCizkjLrdI=', NULL, 0, 'TD', '', '', 'TD@gmail.com', 0, 1, '2026-07-19 07:58:58.992411', 'USER', '6352916077', '', NULL, 'Ahmedabad', 'Gujarat', NULL, 0),
(11, 'pbkdf2_sha256$1200000$K6fvD3PedR32k0snG8OxiD$ObdLzJsk76sLFEIUIQEtcg51YYvJRBBO44QEmS7DitQ=', NULL, 0, 'Darshan', '', '', 'darshan@gmail.com', 0, 1, '2026-07-24 17:25:36.711633', 'USER', '6352916078', '', NULL, 'Ahmedabad', 'Gujarat', NULL, 0),
(12, 'pbkdf2_sha256$1200000$sUvHuEX2hOqlDey93MeWdr$qZ17sUOmhS3DgZuRECIYHC//lBdRkNc+L3qxsaQGIyM=', NULL, 0, 'TanayDesai', '', '', '', 0, 1, '2026-07-24 19:26:02.065971', 'ADMIN', '6352916087', '', NULL, NULL, NULL, NULL, 0);

-- Table structure for table `users_user_groups`
DROP TABLE IF EXISTS `users_user_groups`;
CREATE TABLE `users_user_groups` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `group_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_user_groups_user_id_group_id_b88eab82_uniq` (`user_id`,`group_id`),
  KEY `users_user_groups_group_id_9afc8d0e_fk_auth_group_id` (`group_id`),
  CONSTRAINT `users_user_groups_group_id_9afc8d0e_fk_auth_group_id` FOREIGN KEY (`group_id`) REFERENCES `auth_group` (`id`),
  CONSTRAINT `users_user_groups_user_id_5f6f5a90_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `users_user_user_permissions`
DROP TABLE IF EXISTS `users_user_user_permissions`;
CREATE TABLE `users_user_user_permissions` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL,
  `permission_id` int(11) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `users_user_user_permissions_user_id_permission_id_43338c45_uniq` (`user_id`,`permission_id`),
  KEY `users_user_user_perm_permission_id_0b93982e_fk_auth_perm` (`permission_id`),
  CONSTRAINT `users_user_user_perm_permission_id_0b93982e_fk_auth_perm` FOREIGN KEY (`permission_id`) REFERENCES `auth_permission` (`id`),
  CONSTRAINT `users_user_user_permissions_user_id_20aca447_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Table structure for table `vehicles_vehicle`
DROP TABLE IF EXISTS `vehicles_vehicle`;
CREATE TABLE `vehicles_vehicle` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `vehicle_type` varchar(10) NOT NULL,
  `brand` varchar(50) NOT NULL,
  `model` varchar(50) NOT NULL,
  `variant` varchar(50) DEFAULT NULL,
  `registration_number` varchar(20) NOT NULL,
  `battery_capacity` decimal(6,2) NOT NULL,
  `current_battery_percentage` decimal(5,2) NOT NULL,
  `connector_type` varchar(20) NOT NULL,
  `efficiency` decimal(5,2) NOT NULL,
  `manufacturing_year` int(10) unsigned NOT NULL CHECK (`manufacturing_year` >= 0),
  `color` varchar(30) DEFAULT NULL,
  `created_at` datetime(6) NOT NULL,
  `user_id` bigint(20) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `registration_number` (`registration_number`),
  KEY `vehicles_vehicle_user_id_96a55eeb_fk_users_user_id` (`user_id`),
  CONSTRAINT `vehicles_vehicle_user_id_96a55eeb_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Dumping data for table `vehicles_vehicle`
INSERT INTO `vehicles_vehicle` (`id`, `vehicle_type`, `brand`, `model`, `variant`, `registration_number`, `battery_capacity`, `current_battery_percentage`, `connector_type`, `efficiency`, `manufacturing_year`, `color`, `created_at`, `user_id`) VALUES
(1, 'Car', 'BMW', 'ix', 'xDrive 50', 'abc8307', '60.00', '95.45', 'Type2', '25.00', 2026, 'Black Sapphire', '2026-07-06 17:53:30.743545', 2),
(2, 'Car', 'Tata', 'Nexon EV', NULL, 'GJ01XY8307', '40.50', '40.00', 'CCS2', '0.15', 2025, NULL, '2026-07-11 10:45:26.292071', 2),
(4, 'Car', 'TATA', 'NEXON.EV', 'Empowered 45', 'GJ01AB2525', '45.00', '60.00', 'CCS2', '10.80', 2026, 'Ocean Blue', '2026-07-19 08:02:48.123428', 10),
(5, 'Car', 'TATA', 'siyara', 'xDrive 50', 'abc28308', '65.00', '40.00', 'Type2', '15.00', 2026, 'Black', '2026-07-23 17:53:43.714006', 2);

SET FOREIGN_KEY_CHECKS=1;
