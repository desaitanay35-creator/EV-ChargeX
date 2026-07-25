-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: 127.0.0.1    Database: ev_chargex_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `auth_group`
--

DROP TABLE IF EXISTS `auth_group`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_group` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(150) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `name` (`name`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group`
--

LOCK TABLES `auth_group` WRITE;
/*!40000 ALTER TABLE `auth_group` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_group_permissions`
--

DROP TABLE IF EXISTS `auth_group_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_group_permissions`
--

LOCK TABLES `auth_group_permissions` WRITE;
/*!40000 ALTER TABLE `auth_group_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `auth_group_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `auth_permission`
--

DROP TABLE IF EXISTS `auth_permission`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `auth_permission` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `content_type_id` int(11) NOT NULL,
  `codename` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `auth_permission_content_type_id_codename_01ab375a_uniq` (`content_type_id`,`codename`),
  CONSTRAINT `auth_permission_content_type_id_2f476e4b_fk_django_co` FOREIGN KEY (`content_type_id`) REFERENCES `django_content_type` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=65 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `auth_permission`
--

LOCK TABLES `auth_permission` WRITE;
/*!40000 ALTER TABLE `auth_permission` DISABLE KEYS */;
INSERT INTO `auth_permission` VALUES (1,'Can add log entry',1,'add_logentry'),(2,'Can change log entry',1,'change_logentry'),(3,'Can delete log entry',1,'delete_logentry'),(4,'Can view log entry',1,'view_logentry'),(5,'Can add permission',2,'add_permission'),(6,'Can change permission',2,'change_permission'),(7,'Can delete permission',2,'delete_permission'),(8,'Can view permission',2,'view_permission'),(9,'Can add group',3,'add_group'),(10,'Can change group',3,'change_group'),(11,'Can delete group',3,'delete_group'),(12,'Can view group',3,'view_group'),(13,'Can add content type',4,'add_contenttype'),(14,'Can change content type',4,'change_contenttype'),(15,'Can delete content type',4,'delete_contenttype'),(16,'Can view content type',4,'view_contenttype'),(17,'Can add session',5,'add_session'),(18,'Can change session',5,'change_session'),(19,'Can delete session',5,'delete_session'),(20,'Can view session',5,'view_session'),(21,'Can add booking',6,'add_booking'),(22,'Can change booking',6,'change_booking'),(23,'Can delete booking',6,'delete_booking'),(24,'Can view booking',6,'view_booking'),(25,'Can add charger',7,'add_charger'),(26,'Can change charger',7,'change_charger'),(27,'Can delete charger',7,'delete_charger'),(28,'Can view charger',7,'view_charger'),(29,'Can add charging session',8,'add_chargingsession'),(30,'Can change charging session',8,'change_chargingsession'),(31,'Can delete charging session',8,'delete_chargingsession'),(32,'Can view charging session',8,'view_chargingsession'),(33,'Can add notification',9,'add_notification'),(34,'Can change notification',9,'change_notification'),(35,'Can delete notification',9,'delete_notification'),(36,'Can view notification',9,'view_notification'),(37,'Can add payment',10,'add_payment'),(38,'Can change payment',10,'change_payment'),(39,'Can delete payment',10,'delete_payment'),(40,'Can view payment',10,'view_payment'),(41,'Can add vehicle',11,'add_vehicle'),(42,'Can change vehicle',11,'change_vehicle'),(43,'Can delete vehicle',11,'delete_vehicle'),(44,'Can view vehicle',11,'view_vehicle'),(45,'Can add station',12,'add_station'),(46,'Can change station',12,'change_station'),(47,'Can delete station',12,'delete_station'),(48,'Can view station',12,'view_station'),(49,'Can add trip',13,'add_trip'),(50,'Can change trip',13,'change_trip'),(51,'Can delete trip',13,'delete_trip'),(52,'Can view trip',13,'view_trip'),(53,'Can add user',14,'add_user'),(54,'Can change user',14,'change_user'),(55,'Can delete user',14,'delete_user'),(56,'Can view user',14,'view_user'),(57,'Can add review',15,'add_review'),(58,'Can change review',15,'change_review'),(59,'Can delete review',15,'delete_review'),(60,'Can view review',15,'view_review'),(61,'Can add favorite station',16,'add_favoritestation'),(62,'Can change favorite station',16,'change_favoritestation'),(63,'Can delete favorite station',16,'delete_favoritestation'),(64,'Can view favorite station',16,'view_favoritestation');
/*!40000 ALTER TABLE `auth_permission` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `bookings_booking`
--

DROP TABLE IF EXISTS `bookings_booking`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
  PRIMARY KEY (`id`),
  KEY `bookings_booking_charger_id_a2009feb_fk_charging_charger_id` (`charger_id`),
  KEY `bookings_booking_station_id_4de720de_fk_stations_station_id` (`station_id`),
  KEY `bookings_booking_trip_id_1cf36b39_fk_trips_trip_id` (`trip_id`),
  KEY `bookings_booking_user_id_834dfc23_fk_users_user_id` (`user_id`),
  CONSTRAINT `bookings_booking_charger_id_a2009feb_fk_charging_charger_id` FOREIGN KEY (`charger_id`) REFERENCES `charging_charger` (`id`),
  CONSTRAINT `bookings_booking_station_id_4de720de_fk_stations_station_id` FOREIGN KEY (`station_id`) REFERENCES `stations_station` (`id`),
  CONSTRAINT `bookings_booking_trip_id_1cf36b39_fk_trips_trip_id` FOREIGN KEY (`trip_id`) REFERENCES `trips_trip` (`id`),
  CONSTRAINT `bookings_booking_user_id_834dfc23_fk_users_user_id` FOREIGN KEY (`user_id`) REFERENCES `users_user` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=10 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `bookings_booking`
--

LOCK TABLES `bookings_booking` WRITE;
/*!40000 ALTER TABLE `bookings_booking` DISABLE KEYS */;
INSERT INTO `bookings_booking` VALUES (1,'2026-07-07','23:43:44.000000','00:20:00.000000',25,'COMPLETED','EV-BKG-92870E95F6','2026-07-07 18:14:15.528422',1,1,4,2,0,0),(2,'2026-07-09','17:12:03.000000','18:00:00.000000',45,'PENDING','EV-BKG-93B1DEE6EB','2026-07-09 10:42:34.546687',1,1,4,2,0,0),(3,'2026-07-09','18:00:00.000000','19:00:00.000000',60,'CONFIRMED','booking_qr/booking_3.png','2026-07-09 10:56:17.146472',1,1,4,2,1,0),(4,'2026-07-09','22:47:19.000000','23:11:00.000000',22,'PENDING','EV-BKG-8987905607','2026-07-09 17:17:41.394774',1,1,4,2,0,0),(5,'2026-07-09','22:52:03.000000','22:52:04.000000',20,'PENDING','EV-BKG-3FFE3CE509','2026-07-09 17:22:10.438137',1,1,4,2,0,0),(6,'2026-07-09','22:56:27.000000','22:56:28.000000',22,'PENDING','EV-BKG-1106B8C294','2026-07-09 17:26:33.174721',1,1,4,2,0,0),(7,'2026-07-10','18:00:00.000000','19:00:00.000000',60,'COMPLETED','booking_qr/booking_7.png','2026-07-09 17:28:12.938572',1,1,4,2,1,0),(8,'2026-07-10','20:00:00.000000','21:00:00.000000',60,'COMPLETED','booking_qr/booking_8.png','2026-07-09 17:45:08.984107',1,1,4,2,1,0),(9,'2026-07-10','19:00:00.000000','20:00:00.000000',60,'COMPLETED','booking_qr/booking_9.png','2026-07-09 18:09:34.014505',1,1,4,2,1,1);
/*!40000 ALTER TABLE `bookings_booking` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `charging_charger`
--

DROP TABLE IF EXISTS `charging_charger`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `charging_charger`
--

LOCK TABLES `charging_charger` WRITE;
/*!40000 ALTER TABLE `charging_charger` DISABLE KEYS */;
INSERT INTO `charging_charger` VALUES (1,'AC-Fast','01','AC','Type2',65.00,42,410,13.00,'AVAILABLE','2026-07-07','2026-07-07','2026-07-07 18:13:25.802932',1);
/*!40000 ALTER TABLE `charging_charger` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `charging_chargingsession`
--

DROP TABLE IF EXISTS `charging_chargingsession`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `charging_chargingsession`
--

LOCK TABLES `charging_chargingsession` WRITE;
/*!40000 ALTER TABLE `charging_chargingsession` DISABLE KEYS */;
INSERT INTO `charging_chargingsession` VALUES (1,'2026-07-07 18:14:29.000000','2026-07-09 17:10:37.838130',54.00,85.00,18.60,241.80,'COMPLETED','2026-07-07 18:15:19.720046',1,1,1),(2,'2026-07-07 18:47:44.000000','2026-07-09 18:24:35.088854',20.00,80.00,56.00,569.00,'COMPLETED','2026-07-07 18:48:23.207205',1,1,1),(3,'2026-07-07 18:50:11.000000','2026-07-07 19:13:39.635983',20.00,90.00,42.00,546.00,'COMPLETED','2026-07-07 18:50:34.181211',1,1,1),(4,'2026-07-09 17:47:00.340982','2026-07-10 07:44:30.772000',89.00,91.40,1.44,18.72,'COMPLETED','2026-07-09 17:47:00.341528',8,1,1),(5,'2026-07-09 18:12:47.313147','2026-07-10 10:54:16.594414',89.00,99.00,6.00,78.00,'COMPLETED','2026-07-09 18:12:47.313743',9,1,1);
/*!40000 ALTER TABLE `charging_chargingsession` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_admin_log`
--

DROP TABLE IF EXISTS `django_admin_log`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_admin_log`
--

LOCK TABLES `django_admin_log` WRITE;
/*!40000 ALTER TABLE `django_admin_log` DISABLE KEYS */;
INSERT INTO `django_admin_log` VALUES (1,'2026-07-06 17:47:28.803482','2','Tanay',1,'[{\"added\": {}}]',14,1),(2,'2026-07-06 17:47:55.186796','2','Tanay',2,'[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Email address\", \"Last login\", \"Address\", \"City\", \"State\", \"Pincode\"]}}]',14,1),(3,'2026-07-06 17:53:30.747287','1','BMW ix (abc8307)',1,'[{\"added\": {}}]',11,1),(4,'2026-07-06 17:58:47.832591','3','TATA',1,'[{\"added\": {}}]',14,1),(5,'2026-07-06 17:59:12.751245','3','TATA',2,'[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Email address\", \"Last login\", \"Address\", \"City\", \"State\", \"Pincode\"]}}]',14,1),(6,'2026-07-06 18:00:17.269811','1','TORENT EV',1,'[{\"added\": {}}]',12,1),(7,'2026-07-06 18:12:50.082107','4','Surat ➜ Ahmedabad',1,'[{\"added\": {}}]',13,1),(8,'2026-07-07 18:13:25.804957','1','TORENT EV - AC-Fast',1,'[{\"added\": {}}]',7,1),(9,'2026-07-07 18:14:15.530768','1','Booking #1',1,'[{\"added\": {}}]',6,1),(10,'2026-07-07 18:15:19.732795','1','Session #1',1,'[{\"added\": {}}]',8,1),(11,'2026-07-07 18:48:23.223139','2','Session #2',1,'[{\"added\": {}}]',8,1),(12,'2026-07-07 18:50:34.191751','3','Session #3',1,'[{\"added\": {}}]',8,1),(13,'2026-07-08 17:57:09.414809','1','desaitanay35@gmail.com - TORENT EV',1,'[{\"added\": {}}]',16,1),(14,'2026-07-08 18:02:03.654791','2','desaitanay35@gmail.com - TORENT EV',1,'[{\"added\": {}}]',16,1),(15,'2026-07-09 10:17:08.252676','5','Torent',1,'[{\"added\": {}}]',14,1),(16,'2026-07-09 10:17:40.284448','5','Torent',2,'[{\"changed\": {\"fields\": [\"First name\", \"Last name\", \"Email address\", \"Last login\", \"Address\", \"City\", \"State\", \"Pincode\"]}}]',14,1),(17,'2026-07-09 10:25:18.432198','1','evchargex',2,'[{\"changed\": {\"fields\": [\"Role\"]}}]',14,1),(18,'2026-07-09 10:41:38.454867','1','Booking #1',2,'[]',6,1),(19,'2026-07-09 10:42:34.553777','2','Booking #2',1,'[{\"added\": {}}]',6,1),(20,'2026-07-09 17:17:41.407710','4','Booking #4',1,'[{\"added\": {}}]',6,1),(21,'2026-07-09 17:21:41.268822','4','Booking #4',2,'[]',6,1),(22,'2026-07-09 17:22:10.444762','5','Booking #5',1,'[{\"added\": {}}]',6,1),(23,'2026-07-09 17:22:30.007145','5','Booking #5',2,'[{\"changed\": {\"fields\": [\"Booking status\"]}}]',6,1),(24,'2026-07-09 17:22:37.372887','5','Booking #5',2,'[{\"changed\": {\"fields\": [\"Is qr used\"]}}]',6,1),(25,'2026-07-09 17:22:55.101003','5','Booking #5',2,'[{\"changed\": {\"fields\": [\"Booking status\", \"Is qr used\"]}}]',6,1),(26,'2026-07-09 17:26:33.188864','6','Booking #6',1,'[{\"added\": {}}]',6,1),(27,'2026-07-09 17:45:05.089260','1','TORENT EV - AC-Fast',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',7,1),(28,'2026-07-09 18:09:29.602489','1','TORENT EV - AC-Fast',2,'[{\"changed\": {\"fields\": [\"Status\"]}}]',7,1),(29,'2026-07-09 18:24:11.260780','2','Session #2',2,'[{\"changed\": {\"fields\": [\"Session status\"]}}]',8,1),(30,'2026-07-09 19:02:12.864392','1','Payment #1 - PENDING',2,'[{\"changed\": {\"fields\": [\"Charging session\"]}}]',10,1),(31,'2026-07-11 10:52:07.005122','1','TORENT EV',2,'[{\"changed\": {\"fields\": [\"Latitude\", \"Longitude\"]}}]',12,1);
/*!40000 ALTER TABLE `django_admin_log` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_content_type`
--

DROP TABLE IF EXISTS `django_content_type`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_content_type` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `app_label` varchar(100) NOT NULL,
  `model` varchar(100) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `django_content_type_app_label_model_76bd3d3b_uniq` (`app_label`,`model`)
) ENGINE=InnoDB AUTO_INCREMENT=17 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_content_type`
--

LOCK TABLES `django_content_type` WRITE;
/*!40000 ALTER TABLE `django_content_type` DISABLE KEYS */;
INSERT INTO `django_content_type` VALUES (1,'admin','logentry'),(3,'auth','group'),(2,'auth','permission'),(6,'bookings','booking'),(7,'charging','charger'),(8,'charging','chargingsession'),(4,'contenttypes','contenttype'),(16,'favorites','favoritestation'),(9,'notifications','notification'),(10,'payments','payment'),(15,'reviews','review'),(5,'sessions','session'),(12,'stations','station'),(13,'trips','trip'),(14,'users','user'),(11,'vehicles','vehicle');
/*!40000 ALTER TABLE `django_content_type` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_migrations`
--

DROP TABLE IF EXISTS `django_migrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_migrations` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `app` varchar(255) NOT NULL,
  `name` varchar(255) NOT NULL,
  `applied` datetime(6) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_migrations`
--

LOCK TABLES `django_migrations` WRITE;
/*!40000 ALTER TABLE `django_migrations` DISABLE KEYS */;
INSERT INTO `django_migrations` VALUES (1,'contenttypes','0001_initial','2026-07-06 17:12:10.670399'),(2,'contenttypes','0002_remove_content_type_name','2026-07-06 17:12:10.756036'),(3,'auth','0001_initial','2026-07-06 17:12:11.059433'),(4,'auth','0002_alter_permission_name_max_length','2026-07-06 17:12:11.157663'),(5,'auth','0003_alter_user_email_max_length','2026-07-06 17:12:11.163824'),(6,'auth','0004_alter_user_username_opts','2026-07-06 17:12:11.170722'),(7,'auth','0005_alter_user_last_login_null','2026-07-06 17:12:11.175854'),(8,'auth','0006_require_contenttypes_0002','2026-07-06 17:12:11.179001'),(9,'auth','0007_alter_validators_add_error_messages','2026-07-06 17:12:11.183346'),(10,'auth','0008_alter_user_username_max_length','2026-07-06 17:12:11.191443'),(11,'auth','0009_alter_user_last_name_max_length','2026-07-06 17:12:11.195627'),(12,'auth','0010_alter_group_name_max_length','2026-07-06 17:12:11.204087'),(13,'auth','0011_update_proxy_permissions','2026-07-06 17:12:11.210423'),(14,'auth','0012_alter_user_first_name_max_length','2026-07-06 17:12:11.215674'),(15,'users','0001_initial','2026-07-06 17:12:11.546409'),(16,'admin','0001_initial','2026-07-06 17:12:11.710400'),(17,'admin','0002_logentry_remove_auto_add','2026-07-06 17:12:11.720431'),(18,'admin','0003_logentry_add_action_flag_choices','2026-07-06 17:12:11.726850'),(19,'vehicles','0001_initial','2026-07-06 17:12:11.814598'),(20,'stations','0001_initial','2026-07-06 17:12:11.907753'),(21,'trips','0001_initial','2026-07-06 17:12:12.118919'),(22,'trips','0002_remove_trip_destination_trip_destination_latitude_and_more','2026-07-06 17:12:12.180375'),(23,'charging','0001_initial','2026-07-06 17:12:12.260037'),(24,'bookings','0001_initial','2026-07-06 17:12:12.529679'),(25,'charging','0002_chargingsession','2026-07-06 17:12:12.787842'),(26,'notifications','0001_initial','2026-07-06 17:12:12.890721'),(27,'payments','0001_initial','2026-07-06 17:12:13.104942'),(28,'sessions','0001_initial','2026-07-06 17:12:13.140432'),(29,'users','0002_alter_user_phone','2026-07-06 17:12:13.190960'),(30,'trips','0003_trip_destination','2026-07-06 18:11:00.479868'),(31,'reviews','0001_initial','2026-07-08 17:41:42.845550'),(32,'favorites','0001_initial','2026-07-08 17:53:51.131092'),(33,'bookings','0002_booking_is_qr_used','2026-07-09 11:29:07.931954'),(34,'notifications','0002_alter_notification_notification_type_and_more','2026-07-09 11:29:08.052352'),(35,'bookings','0003_booking_is_verified','2026-07-09 18:02:18.411512'),(36,'payments','0002_remove_payment_bill_pdf_remove_payment_payment_date_and_more','2026-07-09 18:43:47.911409'),(37,'notifications','0003_alter_notification_notification_type_and_more','2026-07-09 19:26:08.736814'),(38,'bookings','0002_booking_is_qr_used_booking_is_verified','2026-07-11 10:36:35.062693');
/*!40000 ALTER TABLE `django_migrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `django_session`
--

DROP TABLE IF EXISTS `django_session`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `django_session` (
  `session_key` varchar(40) NOT NULL,
  `session_data` longtext NOT NULL,
  `expire_date` datetime(6) NOT NULL,
  PRIMARY KEY (`session_key`),
  KEY `django_session_expire_date_a5c62663` (`expire_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `django_session`
--

LOCK TABLES `django_session` WRITE;
/*!40000 ALTER TABLE `django_session` DISABLE KEYS */;
INSERT INTO `django_session` VALUES ('j1wxkcv7d298plhmvm871r8hcd957bvl','.eJxVjMsOgjAQRf-la9MUBqHj0j3fQOZVixpIKKyM_64kLHR7zzn35Qba1jxsxZZhVHdxlTv9bkzysGkHeqfpNnuZp3UZ2e-KP2jx_az2vB7u30Gmkr91G5KyKFJXC0k0OcckGCuurQPBxgIrYEClrm2RIaQEdSAwYBDCxr0_EwY4xA:1wgmv3:xMalOLW5ZUTm6tv2sP37FVVk8s--AUBoIp_i2MwME1M','2026-07-20 17:15:45.201877'),('r6yckj7wwbo1ghc1rsaxdyl0hbvy660a','.eJxVjMsOgjAQRf-la9MUBqHj0j3fQOZVixpIKKyM_64kLHR7zzn35Qba1jxsxZZhVHdxlTv9bkzysGkHeqfpNnuZp3UZ2e-KP2jx_az2vB7u30Gmkr91G5KyKFJXC0k0OcckGCuurQPBxgIrYEClrm2RIaQEdSAwYBDCxr0_EwY4xA:1whWLc:Qn6JPHAULKYxzcm0Lz2D7ZX3UNtw84dcRSea_RB9rXM','2026-07-22 17:46:12.897988');
/*!40000 ALTER TABLE `django_session` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `favorites_favoritestation`
--

DROP TABLE IF EXISTS `favorites_favoritestation`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `favorites_favoritestation`
--

LOCK TABLES `favorites_favoritestation` WRITE;
/*!40000 ALTER TABLE `favorites_favoritestation` DISABLE KEYS */;
/*!40000 ALTER TABLE `favorites_favoritestation` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `notifications_notification`
--

DROP TABLE IF EXISTS `notifications_notification`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `notifications_notification`
--

LOCK TABLES `notifications_notification` WRITE;
/*!40000 ALTER TABLE `notifications_notification` DISABLE KEYS */;
INSERT INTO `notifications_notification` VALUES (1,'Booking Confirmed','Your booking #1 at TORENT EV for charger AC-Fast is confirmed on 2026-07-07 from 23:43:44 to 00:20:00.','BOOKING',1,'2026-07-07 18:14:15.530335',2),(2,'Charging Session Started','Charging session #1 has started for vehicle BMW ix. Current battery: 54%.','CHARGING',1,'2026-07-07 18:15:19.727377',2),(3,'Charging Session Started','Charging session #2 has started for vehicle BMW ix. Current battery: 20%.','CHARGING',1,'2026-07-07 18:48:23.214890',2),(4,'Charging Session Completed','Charging session #2 completed. Battery charged to 89%. Energy consumed: 56 kWh. Total cost: ₹569.','CHARGING',1,'2026-07-07 18:48:23.216955',2),(5,'Charging Session Started','Charging session #3 has started for vehicle BMW ix. Current battery: 20%.','CHARGING',1,'2026-07-07 18:50:34.188113',2),(6,'Charging Session Completed','Charging session #3 completed. Battery charged to 90.0%. Energy consumed: 42.00 kWh. Total cost: ₹546.00.','CHARGING',1,'2026-07-07 19:13:39.647583',2),(7,'Payment Pending','Payment of ₹546.00 failed (Transaction: TXN-C102D34AA1).','PAYMENT',1,'2026-07-07 19:13:39.657451',2),(8,'Booking Confirmed','Your booking #2 at TORENT EV for charger AC-Fast is confirmed on 2026-07-09 from 17:12:03 to 18:00:00.','BOOKING',1,'2026-07-09 10:42:34.550963',2),(9,'Booking Confirmed','Your booking #3 at TORENT EV for charger AC-Fast is confirmed on 2026-07-09 from 18:00:00 to 19:00:00.','BOOKING',1,'2026-07-09 10:56:17.153206',2),(10,'Charging Session Completed','Charging session #1 completed. Battery charged to 85.0%. Energy consumed: 18.60 kWh. Total cost: ₹241.80.','CHARGING',1,'2026-07-09 17:10:37.852248',2),(11,'Payment Pending','Payment of ₹241.80 failed (Transaction: TXN-A87BB0BD1A).','PAYMENT',1,'2026-07-09 17:10:37.864374',2),(12,'Booking Confirmed','Your booking #4 at TORENT EV for charger AC-Fast is confirmed on 2026-07-09 from 22:47:19 to 23:11:00.','BOOKING',1,'2026-07-09 17:17:41.397494',2),(13,'Booking Confirmed','Your booking #5 at TORENT EV for charger AC-Fast is confirmed on 2026-07-09 from 22:52:03 to 22:52:04.','BOOKING',1,'2026-07-09 17:22:10.442979',2),(14,'Booking Confirmed','Your booking #6 at TORENT EV for charger AC-Fast is confirmed on 2026-07-09 from 22:56:27 to 22:56:28.','BOOKING',1,'2026-07-09 17:26:33.183058',2),(15,'Booking Confirmed','Your booking #7 at TORENT EV for charger AC-Fast is confirmed on 2026-07-10 from 18:00:00 to 19:00:00.','BOOKING',1,'2026-07-09 17:28:12.941885',2),(16,'Booking Confirmed','Your booking #8 at TORENT EV for charger AC-Fast is confirmed on 2026-07-10 from 20:00:00 to 21:00:00.','BOOKING',1,'2026-07-09 17:45:08.989930',2),(17,'Charging Session Started','Charging session #4 has started for vehicle BMW ix. Current battery: 89.0%.','CHARGING',1,'2026-07-09 17:47:00.359529',2),(18,'Booking Confirmed','Your booking #9 at TORENT EV for charger AC-Fast is confirmed on 2026-07-10 from 19:00:00 to 20:00:00.','BOOKING',1,'2026-07-09 18:09:34.018319',2),(19,'Charging Session Started','Charging session #5 has started for vehicle BMW ix. Current battery: 89.00%.','CHARGING',1,'2026-07-09 18:12:47.320759',2),(20,'Charging Session Started','Charging session #2 has started for vehicle BMW ix. Current battery: 20.00%.','CHARGING',1,'2026-07-09 18:24:11.256231',2),(21,'Charging Session Completed','Charging session #2 completed. Battery charged to 80%. Energy consumed: 56.00 kWh. Total cost: ₹569.00.','CHARGING',1,'2026-07-09 18:24:35.120875',2),(22,'Payment Success','Payment of ₹546.00 was successful (Transaction: TXN-90A7B3573F).','PAYMENT',1,'2026-07-09 19:22:36.096791',2),(23,'Charging Session Completed','Charging session #4 completed. Battery charged to 91.40%. Energy consumed: 1.44000 kWh. Total cost: ₹18.7200000.','CHARGING',1,'2026-07-10 07:44:30.821738',2),(24,'Charger Available','AC-Fast is now available.','CHARGING',1,'2026-07-10 10:54:16.635133',2),(25,'Charging Completed','Charging completed successfully.\nEnergy: 6.000 kWh\nCost: ₹78.00000','CHARGING',1,'2026-07-10 10:54:16.639564',2);
/*!40000 ALTER TABLE `notifications_notification` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `payments_payment`
--

DROP TABLE IF EXISTS `payments_payment`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `payments_payment`
--

LOCK TABLES `payments_payment` WRITE;
/*!40000 ALTER TABLE `payments_payment` DISABLE KEYS */;
INSERT INTO `payments_payment` VALUES (1,546.00,'UPI','TXN-90A7B3573F','SUCCESS','2026-07-07 19:13:39.654837',2,1,'2026-07-09 19:22:36.079638',NULL,NULL),(2,241.80,'UPI','TXN-A87BB0BD1A','PENDING','2026-07-09 17:10:37.861699',2,NULL,NULL,NULL,NULL),(3,78.00,NULL,NULL,'PENDING','2026-07-10 10:54:16.642489',2,5,NULL,NULL,NULL);
/*!40000 ALTER TABLE `payments_payment` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `reviews_review`
--

DROP TABLE IF EXISTS `reviews_review`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `reviews_review`
--

LOCK TABLES `reviews_review` WRITE;
/*!40000 ALTER TABLE `reviews_review` DISABLE KEYS */;
INSERT INTO `reviews_review` VALUES (1,5,'Excellent charging station.','2026-07-08 17:49:31.173403','2026-07-08 17:49:31.173421',1,2);
/*!40000 ALTER TABLE `reviews_review` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `stations_station`
--

DROP TABLE IF EXISTS `stations_station`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `stations_station`
--

LOCK TABLES `stations_station` WRITE;
/*!40000 ALTER TABLE `stations_station` DISABLE KEYS */;
INSERT INTO `stations_station` VALUES (1,'TORENT EV','13/156 gokul apt,parasnagar, sola road ,ahmedabad','Ahmedabad','Gujarat','380063',23.0551776,72.5439939,'06:00:00.000000','23:29:54.000000','8959632689','desaitanay35@gmail.com','',5.0,'OPEN','2026-07-06 18:00:17.268733',3);
/*!40000 ALTER TABLE `stations_station` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `trips_trip`
--

DROP TABLE IF EXISTS `trips_trip`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `trips_trip`
--

LOCK TABLES `trips_trip` WRITE;
/*!40000 ALTER TABLE `trips_trip` DISABLE KEYS */;
INSERT INTO `trips_trip` VALUES (4,'Surat',290.00,300,89.00,'PLANNED','2026-07-06 18:12:37.000000','2026-07-07 00:30:00.000000','2026-07-06 18:12:50.076497',1,2,1,24.8956890,24.5689740,23.5689450,23.5689750,'Ahmedabad'),(5,'Ahmedabad',251.72,174,80.00,'PLANNED',NULL,NULL,'2026-07-10 07:43:58.531142',1,2,1,NULL,NULL,NULL,NULL,'Surat'),(6,'Current Location',5.00,15,2.08,'PLANNED',NULL,NULL,'2026-07-11 10:42:51.990054',1,2,1,27.8005545,28.8777980,27.8005545,28.8777980,'TORENT EV'),(7,'Current Location',5.00,15,2.08,'PLANNED',NULL,NULL,'2026-07-11 11:28:53.971316',1,2,1,23.0551776,72.5439939,23.0551776,72.5439939,'TORENT EV'),(8,'Current Location',5.00,15,2.08,'PLANNED',NULL,NULL,'2026-07-11 11:28:57.219733',1,2,1,23.0551776,72.5439939,23.0551776,72.5439939,'TORENT EV');
/*!40000 ALTER TABLE `trips_trip` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_user`
--

DROP TABLE IF EXISTS `users_user`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=6 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_user`
--

LOCK TABLES `users_user` WRITE;
/*!40000 ALTER TABLE `users_user` DISABLE KEYS */;
INSERT INTO `users_user` VALUES (1,'pbkdf2_sha256$600000$h6T8ZDhx9TO6E2B4oDJcYz$/MSbzO7brkrMSxvX6JnmiYGo7jO/R+XIpl/+4xnxMPY=','2026-07-08 17:46:12.000000',1,'evchargex','','','desaitanay35@gmail.com',1,1,'2026-07-06 17:14:31.000000','ADMIN',NULL,'','',NULL,NULL,NULL,0),(2,'pbkdf2_sha256$600000$eCWAlthtEE5gD2TO7wnNiQ$XjkI4kMID0JU+Ov8z87vOZ4KgssjtgsBy+Fwdufd+/o=','2026-07-06 17:47:43.000000',0,'Tanay','Tanay','Desai','desaitanay35@gmail.com',0,1,'2026-07-06 17:47:28.000000','USER','6352916072','','13/156 gokul apt,parasnagar, sola road ,ahmedabad','Ahmedabad','Gujarat','380063',0),(3,'pbkdf2_sha256$600000$k7MfdRzdu1y8qAbwuf7NRH$ciQftv8o4chM+FtGN53sJJF+AjkIlqy+R2eq9VJxKnw=','2026-07-06 17:59:05.000000',0,'TATA','Tanay','Desai','desaitanay83@gmail.com',0,1,'2026-07-06 17:58:47.000000','OPERATOR','6352916089','','13/156 gokul apt,parasnagar, sola road ,ahmedabad','Ahmedabad','Gujarat','380063',0),(4,'pbkdf2_sha256$600000$0GRB64a6vdq0ibL1hOKYo9$+owW1DNFjolMlfum0YGkhZ4wqjVkcQqhjA3/8q/r6eg=',NULL,0,'testuser','','','testuser@example.com',0,1,'2026-07-07 17:50:10.257500','USER','9876543210','','123 Test Street','Ahmedabad','Gujarat','380009',0),(5,'pbkdf2_sha256$600000$OaMSsNzulPhEUQyEHi1yKu$E7IiLAmAWQhZC3e3gJEyVCkee4YKahsfBWI7xOXTTbM=','2026-07-09 10:17:35.000000',0,'Torent','Tanay','Desai','desai@gmail.com',0,1,'2026-07-09 10:17:07.000000','OPERATOR','8956237415','','13/155,Gokul appertment, Sola Road,naranpura','Ahmedabad','Gujarat','380063',0);
/*!40000 ALTER TABLE `users_user` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_user_groups`
--

DROP TABLE IF EXISTS `users_user_groups`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_user_groups`
--

LOCK TABLES `users_user_groups` WRITE;
/*!40000 ALTER TABLE `users_user_groups` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_user_groups` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users_user_user_permissions`
--

DROP TABLE IF EXISTS `users_user_user_permissions`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users_user_user_permissions`
--

LOCK TABLES `users_user_user_permissions` WRITE;
/*!40000 ALTER TABLE `users_user_user_permissions` DISABLE KEYS */;
/*!40000 ALTER TABLE `users_user_user_permissions` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `vehicles_vehicle`
--

DROP TABLE IF EXISTS `vehicles_vehicle`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
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
) ENGINE=InnoDB AUTO_INCREMENT=3 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `vehicles_vehicle`
--

LOCK TABLES `vehicles_vehicle` WRITE;
/*!40000 ALTER TABLE `vehicles_vehicle` DISABLE KEYS */;
INSERT INTO `vehicles_vehicle` VALUES (1,'Car','BMW','ix','xDrive 50','abc8307',60.00,99.00,'Type2',25.00,2026,'Black Sapphire','2026-07-06 17:53:30.743545',2),(2,'Car','Tata','Nexon EV',NULL,'GJ01XY8307',40.50,40.00,'CCS2',0.15,2025,NULL,'2026-07-11 10:45:26.292071',2);
/*!40000 ALTER TABLE `vehicles_vehicle` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-07-18 15:59:44
