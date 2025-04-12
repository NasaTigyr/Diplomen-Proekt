-- MariaDB dump 10.19  Distrib 10.11.6-MariaDB, for debian-linux-gnu (x86_64)
--
-- Host: localhost    Database: test
-- ------------------------------------------------------
-- Server version	10.11.6-MariaDB-0+deb12u1

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
-- Table structure for table `categories`
--

DROP TABLE IF EXISTS `categories`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categories` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `name` varchar(255) NOT NULL,
  `age_group` enum('under_8','under_12','under_14','under_16','under_18','under_21','senior') NOT NULL,
  `gender` enum('male','female','mixed') NOT NULL,
  `description` text DEFAULT NULL,
  `max_participants` int(11) DEFAULT NULL,
  `draw_file_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `idx_categories_event_id` (`event_id`),
  KEY `idx_categories_age_gender` (`age_group`,`gender`),
  CONSTRAINT `categories_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categories`
--

LOCK TABLES `categories` WRITE;
/*!40000 ALTER TABLE `categories` DISABLE KEYS */;
INSERT INTO `categories` VALUES
(3,6,'Kumite male Seniros','senior','male','seniors kumite \n\nWeight Class: -60kg\n\nSpecial Rules: none\n\nRegistration Fee: $0.00',8,NULL,'2025-04-09 07:35:51','2025-04-09 07:35:51'),
(4,6,'kumite female seniors ','senior','female','female kumite\n\nWeight Class: -50kg\n\nSpecial Rules: none\n\nRegistration Fee: $0.00',8,NULL,'2025-04-09 07:35:51','2025-04-09 07:35:51'),
(5,6,'Kumite male U14 +55','under_14','male','none\n\nWeight Class: +55kg\n\nSpecial Rules: none\n\nRegistration Fee: $0.00',1,NULL,'2025-04-11 12:42:07','2025-04-11 12:42:07'),
(6,6,'ntestho','under_8','male','none\n\nWeight Class: -40kg\n\nSpecial Rules: none\n\nRegistration Fee: $0.00',1,NULL,'2025-04-11 14:35:50','2025-04-11 14:35:50');
/*!40000 ALTER TABLE `categories` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `club_athletes`
--

DROP TABLE IF EXISTS `club_athletes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `club_athletes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `club_id` int(11) NOT NULL,
  `athlete_id` int(11) NOT NULL,
  `join_date` date NOT NULL,
  `status` enum('active','inactive','pending') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_club_athlete` (`club_id`,`athlete_id`),
  KEY `athlete_id` (`athlete_id`),
  CONSTRAINT `club_athletes_ibfk_1` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `club_athletes_ibfk_2` FOREIGN KEY (`athlete_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `club_athletes`
--

LOCK TABLES `club_athletes` WRITE;
/*!40000 ALTER TABLE `club_athletes` DISABLE KEYS */;
INSERT INTO `club_athletes` VALUES
(3,1,17,'2025-04-12','active','2025-04-12 15:04:13','2025-04-12 18:04:42'),
(4,1,18,'2025-04-12','active','2025-04-12 15:05:40','2025-04-12 15:05:40');
/*!40000 ALTER TABLE `club_athletes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `club_invitations`
--

DROP TABLE IF EXISTS `club_invitations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `club_invitations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `club_id` int(11) NOT NULL,
  `athlete_id` int(11) NOT NULL,
  `message` text DEFAULT NULL,
  `status` enum('pending','accepted','rejected','expired') NOT NULL DEFAULT 'pending',
  `sent_date` datetime NOT NULL DEFAULT current_timestamp(),
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `club_id` (`club_id`),
  KEY `athlete_id` (`athlete_id`),
  CONSTRAINT `club_invitations_ibfk_1` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `club_invitations_ibfk_2` FOREIGN KEY (`athlete_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `club_invitations`
--

LOCK TABLES `club_invitations` WRITE;
/*!40000 ALTER TABLE `club_invitations` DISABLE KEYS */;
INSERT INTO `club_invitations` VALUES
(1,1,17,'wnanna join?','accepted','2025-04-12 20:20:45','2025-04-12 17:20:45','2025-04-12 17:44:56'),
(2,1,17,NULL,'accepted','2025-04-12 20:59:54','2025-04-12 17:59:54','2025-04-12 18:00:07'),
(3,1,18,'nesto','accepted','2025-04-12 21:05:28','2025-04-12 18:05:28','2025-04-12 18:05:40');
/*!40000 ALTER TABLE `club_invitations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `clubs`
--

DROP TABLE IF EXISTS `clubs`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `clubs` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `logo` varchar(255) DEFAULT NULL,
  `coach_id` int(11) NOT NULL,
  `address` text DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `registration_code` varchar(50) DEFAULT NULL,
  `phone` varchar(20) DEFAULT NULL,
  `email` varchar(255) DEFAULT NULL,
  `website` varchar(255) DEFAULT NULL,
  `established_date` date DEFAULT NULL,
  `federation_affiliation` varchar(100) DEFAULT NULL,
  `certification_document` varchar(255) DEFAULT NULL,
  `coach_certification` varchar(255) DEFAULT NULL,
  `status` enum('pending','active','rejected') DEFAULT 'pending',
  `verification_status` enum('pending','verified','rejected') DEFAULT 'pending',
  `verification_documents` longtext CHARACTER SET utf8mb4 COLLATE utf8mb4_bin DEFAULT NULL CHECK (json_valid(`verification_documents`)),
  `verification_comments` text DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `coach_id` (`coach_id`),
  CONSTRAINT `clubs_ibfk_1` FOREIGN KEY (`coach_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=2 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `clubs`
--

LOCK TABLES `clubs` WRITE;
/*!40000 ALTER TABLE `clubs` DISABLE KEYS */;
INSERT INTO `clubs` VALUES
(1,'TGR','nesthoi\r\n\r\n\r\n','/uploads/logo-1743004302710-998631208.webp',1,'neshto\r\n','2025-03-26 15:51:42','2025-03-26 15:51:42','8327823523','0886704023','tgrneshtosi@gmail.com','https://www.youtube.com/','2021-03-31','national_karate','/uploads/certification-1743004302712-263635780.pdf','/uploads/coach_certification-1743004302716-233857218.pdf','pending','pending',NULL,NULL);
/*!40000 ALTER TABLE `clubs` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `draws`
--

DROP TABLE IF EXISTS `draws`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `draws` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `category_id` int(11) NOT NULL,
  `status` enum('pending','generated','finalized') NOT NULL DEFAULT 'pending',
  `file_path` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_category_draw` (`category_id`),
  CONSTRAINT `draws_ibfk_1` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `draws`
--

LOCK TABLES `draws` WRITE;
/*!40000 ALTER TABLE `draws` DISABLE KEYS */;
/*!40000 ALTER TABLE `draws` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `events`
--

DROP TABLE IF EXISTS `events`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `events` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `name` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `banner_image` varchar(255) DEFAULT NULL,
  `address` text NOT NULL,
  `start_date` datetime NOT NULL,
  `end_date` datetime NOT NULL,
  `registration_start` datetime NOT NULL,
  `registration_end` datetime NOT NULL,
  `event_type` enum('team','free_for_all') NOT NULL,
  `creator_id` int(11) NOT NULL,
  `timetable_file` varchar(255) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  KEY `creator_id` (`creator_id`),
  KEY `idx_events_event_type` (`event_type`),
  KEY `idx_events_registration_dates` (`registration_start`,`registration_end`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES
(6,'Test event edited twice pishka','test for everything','/uploads/banner_image_file-1744194951146-534329366.jpg','Arena 8888 Sofia','2025-04-25 12:00:00','2025-04-26 12:00:00','2025-04-09 12:00:00','2025-04-24 12:00:00','free_for_all',1,'/uploads/timetable_file-1744477894582-12225556.pdf','2025-04-09 07:35:51','2025-04-12 17:11:34');
/*!40000 ALTER TABLE `events` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `individual_registrations`
--

DROP TABLE IF EXISTS `individual_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `individual_registrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `athlete_id` int(11) NOT NULL,
  `registration_date` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_registration` (`category_id`,`athlete_id`),
  KEY `athlete_id` (`athlete_id`),
  KEY `idx_individual_registrations_event` (`event_id`),
  KEY `idx_individual_registrations_category` (`category_id`),
  CONSTRAINT `individual_registrations_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `individual_registrations_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `individual_registrations_ibfk_3` FOREIGN KEY (`athlete_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=39 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `individual_registrations`
--

LOCK TABLES `individual_registrations` WRITE;
/*!40000 ALTER TABLE `individual_registrations` DISABLE KEYS */;
INSERT INTO `individual_registrations` VALUES
(6,6,3,18,'2025-04-11 16:31:43','approved','2025-04-11 13:31:43','2025-04-11 14:57:31'),
(22,6,5,20,'2025-04-12 11:07:42','rejected','2025-04-12 08:07:42','2025-04-12 12:24:39'),
(29,6,5,19,'2025-04-12 16:28:48','pending','2025-04-12 13:28:48','2025-04-12 13:28:48');
/*!40000 ALTER TABLE `individual_registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_registration_athletes`
--

DROP TABLE IF EXISTS `team_registration_athletes`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `team_registration_athletes` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `team_registration_id` int(11) NOT NULL,
  `athlete_id` int(11) NOT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_team_athlete` (`team_registration_id`,`athlete_id`),
  KEY `athlete_id` (`athlete_id`),
  CONSTRAINT `team_registration_athletes_ibfk_1` FOREIGN KEY (`team_registration_id`) REFERENCES `team_registrations` (`id`) ON DELETE CASCADE,
  CONSTRAINT `team_registration_athletes_ibfk_2` FOREIGN KEY (`athlete_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_registration_athletes`
--

LOCK TABLES `team_registration_athletes` WRITE;
/*!40000 ALTER TABLE `team_registration_athletes` DISABLE KEYS */;
/*!40000 ALTER TABLE `team_registration_athletes` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `team_registrations`
--

DROP TABLE IF EXISTS `team_registrations`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `team_registrations` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `event_id` int(11) NOT NULL,
  `category_id` int(11) NOT NULL,
  `club_id` int(11) NOT NULL,
  `coach_id` int(11) NOT NULL,
  `registration_date` datetime NOT NULL DEFAULT current_timestamp(),
  `status` enum('pending','approved','rejected') NOT NULL DEFAULT 'pending',
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `unique_team_registration` (`category_id`,`club_id`),
  KEY `club_id` (`club_id`),
  KEY `coach_id` (`coach_id`),
  KEY `idx_team_registrations_event` (`event_id`),
  KEY `idx_team_registrations_category` (`category_id`),
  CONSTRAINT `team_registrations_ibfk_1` FOREIGN KEY (`event_id`) REFERENCES `events` (`id`) ON DELETE CASCADE,
  CONSTRAINT `team_registrations_ibfk_2` FOREIGN KEY (`category_id`) REFERENCES `categories` (`id`) ON DELETE CASCADE,
  CONSTRAINT `team_registrations_ibfk_3` FOREIGN KEY (`club_id`) REFERENCES `clubs` (`id`) ON DELETE CASCADE,
  CONSTRAINT `team_registrations_ibfk_4` FOREIGN KEY (`coach_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `team_registrations`
--

LOCK TABLES `team_registrations` WRITE;
/*!40000 ALTER TABLE `team_registrations` DISABLE KEYS */;
/*!40000 ALTER TABLE `team_registrations` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `users`
--

DROP TABLE IF EXISTS `users`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `users` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password_hash` varchar(255) NOT NULL,
  `first_name` varchar(100) NOT NULL,
  `last_name` varchar(100) NOT NULL,
  `date_of_birth` date NOT NULL,
  `gender` enum('male','female','other') NOT NULL,
  `user_type` enum('regular','coach','athlete') NOT NULL DEFAULT 'regular',
  `profile_picture` varchar(255) DEFAULT NULL,
  `contact_number` varchar(20) DEFAULT NULL,
  `created_at` timestamp NULL DEFAULT current_timestamp(),
  `updated_at` timestamp NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`),
  KEY `idx_users_user_type` (`user_type`)
) ENGINE=InnoDB AUTO_INCREMENT=23 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'yanayakimova@gmail.com','$2b$10$asnX8ZbjAD0Cgj.7SXYNHOfkiREoxeUEHL.mmyYR6/xD3PulFo6L.','Yana','Yakimova','2008-12-12','female','coach','/uploads/profile_pictures/profile-1742245547957-619254971.jpg',NULL,'2025-03-14 16:17:08','2025-03-26 15:51:42'),
(17,'niki@gmail.com','$2b$10$dXBjXvg8wY47LcarFgJLW.f25ABD2MzHwakEPCbu56tG0bNrLvZcW','Nikolay','Stefanov','2007-03-26','male','regular','/uploads/profile_picture-1744478501316-897976693.jpg','0886704023','2025-03-30 12:22:57','2025-04-12 17:21:41'),
(18,'aleks@gmail.com','$2b$10$5/HUPs9JhmGKHbvMia0XNOMBWNUPWWnHqz3a5ie7sARW7a8ZxteA6','Aleksander','Stefanov','2011-03-12','male','athlete','/uploads/profile_picture/profile_picture-1744378239799-677977560.png','0886704023','2025-04-11 13:30:39','2025-04-12 18:05:40'),
(19,'aya@gmail.com','$2b$10$t6bPhuWUeE4VMAWfBgsULOtWluhx9bCA55fGKh6mWmtD5GNRXaf3y','Aya','Stefanova','2012-10-10','female','regular','/uploads/profile_picture/profile_picture-1744378472551-82654147.png','0886704023','2025-04-11 13:34:32','2025-04-11 13:34:32'),
(20,'test@gmail.com','$2b$10$SINwOL7fWlI.Obr3eUPp9uw4/yLEtZZR.IieLVwBMgi.3l6poON76','test','test','2025-04-10','male','regular','/uploads/profile_picture/profile_picture-1744386198364-838355519.png','0886704023','2025-04-11 15:43:18','2025-04-11 15:43:18'),
(21,'passtest@gmail.com','$2b$10$pJkTtGD/9hKOnJGe2c9o5uC0OrRRb.lDMYUzMaOUAJ/fyDWAqK3Mi','Pass','test','2025-04-12','male','regular','/uploads/profile_picture/profile_picture-1744464961575-610311422.png','0886704023','2025-04-12 13:36:01','2025-04-12 13:36:38'),
(22,'nn@gmail.com','$2b$10$i.YUqX3xXqHJRIlTkth5c.vBB3m8.iyK/lTDO2Q8Bkp8P0bJp4/46','n','n','2025-04-03','male','regular','/uploads/profile_picture-1744468837461-749114702.png','0886704023','2025-04-12 13:46:17','2025-04-12 14:40:37');
/*!40000 ALTER TABLE `users` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2025-04-12 21:11:11
