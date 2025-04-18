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
) ENGINE=InnoDB AUTO_INCREMENT=11 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
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
(6,6,'ntestho','under_8','male','none\n\nWeight Class: -40kg\n\nSpecial Rules: none\n\nRegistration Fee: $0.00',1,NULL,'2025-04-11 14:35:50','2025-04-11 14:35:50'),
(7,7,'Seinior -50','senior','male','senior -50\n\nWeight Class: -50kg\n\nSpecial Rules: none\n\nRegistration Fee: $0.00',2,NULL,'2025-04-13 06:37:38','2025-04-13 06:37:38'),
(8,7,'female seniors','senior','female','femaile seniors\n\nWeight Class: -50kg\n\nSpecial Rules: none\n\nRegistration Fee: $0.00',2,NULL,'2025-04-13 06:37:38','2025-04-13 06:37:38'),
(9,6,'test cat ','under_8','male','ntest category\n\nWeight Class: -60kg\n\nSpecial Rules: none\n\nRegistration Fee: $0.00',1,NULL,'2025-04-17 07:06:14','2025-04-17 07:06:14'),
(10,8,'notne','under_8','male','psiha\n\nWeight Class: -60kg\n\nSpecial Rules: none\n\nRegistration Fee: $0.00',0,NULL,'2025-04-17 07:07:53','2025-04-17 07:07:53');
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
) ENGINE=InnoDB AUTO_INCREMENT=26 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `club_athletes`
--

LOCK TABLES `club_athletes` WRITE;
/*!40000 ALTER TABLE `club_athletes` DISABLE KEYS */;
INSERT INTO `club_athletes` VALUES
(21,1,24,'2025-04-13','active','2025-04-13 04:35:24','2025-04-13 07:35:38'),
(25,1,17,'2025-04-13','active','2025-04-13 06:39:57','2025-04-13 09:40:04');
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
) ENGINE=InnoDB AUTO_INCREMENT=7 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `club_invitations`
--

LOCK TABLES `club_invitations` WRITE;
/*!40000 ALTER TABLE `club_invitations` DISABLE KEYS */;
INSERT INTO `club_invitations` VALUES
(1,1,17,'wnanna join?','accepted','2025-04-12 20:20:45','2025-04-12 17:20:45','2025-04-12 17:44:56'),
(2,1,17,NULL,'accepted','2025-04-12 20:59:54','2025-04-12 17:59:54','2025-04-12 18:00:07'),
(3,1,18,'nesto','accepted','2025-04-12 21:05:28','2025-04-12 18:05:28','2025-04-12 18:05:40'),
(4,1,17,NULL,'accepted','2025-04-12 22:26:57','2025-04-12 19:26:57','2025-04-12 19:27:07'),
(5,1,17,NULL,'accepted','2025-04-13 09:13:39','2025-04-13 06:13:39','2025-04-13 06:13:54'),
(6,1,17,NULL,'accepted','2025-04-13 09:18:57','2025-04-13 06:18:57','2025-04-13 08:36:54');
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
  `bracket_file` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `creator_id` (`creator_id`),
  KEY `idx_events_event_type` (`event_type`),
  KEY `idx_events_registration_dates` (`registration_start`,`registration_end`),
  CONSTRAINT `events_ibfk_1` FOREIGN KEY (`creator_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `events`
--

LOCK TABLES `events` WRITE;
/*!40000 ALTER TABLE `events` DISABLE KEYS */;
INSERT INTO `events` VALUES
(6,'Test event edited twice pishka','test for everything','/uploads/banner_image_file-1744194951146-534329366.jpg','Arena 8888 Sofia','2025-04-25 12:00:00','2025-04-26 12:00:00','2025-04-09 12:00:00','2025-04-24 12:00:00','free_for_all',1,'/uploads/timetable_file-1744477894582-12225556.pdf','2025-04-09 07:35:51','2025-04-17 05:31:13','/uploads/brackets/brackets_event_6_2025-04-17T05-31-12-975Z.pdf'),
(7,'team test event','team test event','/uploads/banner_image_file-1744537058664-138425738.png','Arena 8888 Sofia','2025-04-18 12:00:00','2025-04-19 12:00:00','2025-04-13 12:00:00','2025-04-14 12:00:00','team',1,NULL,'2025-04-13 06:37:38','2025-04-13 06:37:38',NULL),
(8,'Test event','none','/uploads/banner_image_file-1744884473524-671462654.png','someshit','2025-04-25 12:00:00','2025-04-26 12:00:00','2025-04-17 12:00:00','2025-04-24 12:00:00','free_for_all',1,NULL,'2025-04-17 07:07:53','2025-04-17 07:07:53',NULL);
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
) ENGINE=InnoDB AUTO_INCREMENT=49 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `individual_registrations`
--

LOCK TABLES `individual_registrations` WRITE;
/*!40000 ALTER TABLE `individual_registrations` DISABLE KEYS */;
INSERT INTO `individual_registrations` VALUES
(6,6,3,18,'2025-04-11 16:31:43','approved','2025-04-11 13:31:43','2025-04-11 14:57:31'),
(22,6,5,20,'2025-04-12 11:07:42','rejected','2025-04-12 08:07:42','2025-04-12 12:24:39'),
(29,6,5,19,'2025-04-12 16:28:48','pending','2025-04-12 13:28:48','2025-04-12 13:28:48'),
(39,6,3,17,'2025-04-13 11:40:01','approved','2025-04-13 08:40:01','2025-04-13 08:40:17'),
(40,6,6,22,'2025-04-13 12:17:24','pending','2025-04-13 09:17:24','2025-04-13 09:17:24'),
(41,7,7,17,'2025-04-13 12:40:16','approved','2025-04-13 09:40:16','2025-04-18 11:28:42'),
(42,6,3,25,'2025-04-15 13:59:23','approved','2025-04-15 10:59:23','2025-04-15 10:59:36'),
(43,6,3,26,'2025-04-15 14:01:19','approved','2025-04-15 11:01:19','2025-04-15 11:01:50'),
(44,6,3,28,'2025-04-15 14:03:39','approved','2025-04-15 11:03:39','2025-04-15 11:03:54'),
(45,6,3,27,'2025-04-15 14:04:04','approved','2025-04-15 11:04:04','2025-04-15 11:04:20'),
(46,6,4,31,'2025-04-17 08:30:08','approved','2025-04-17 05:30:08','2025-04-17 05:30:57'),
(47,6,4,29,'2025-04-17 08:30:24','approved','2025-04-17 05:30:24','2025-04-17 05:30:59'),
(48,6,4,30,'2025-04-17 08:30:37','approved','2025-04-17 05:30:37','2025-04-17 05:31:00');
/*!40000 ALTER TABLE `individual_registrations` ENABLE KEYS */;
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
) ENGINE=InnoDB AUTO_INCREMENT=32 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `users`
--

LOCK TABLES `users` WRITE;
/*!40000 ALTER TABLE `users` DISABLE KEYS */;
INSERT INTO `users` VALUES
(1,'yanayakimova@gmail.com','$2b$10$asnX8ZbjAD0Cgj.7SXYNHOfkiREoxeUEHL.mmyYR6/xD3PulFo6L.','Yana','Yakimova','2008-12-12','female','coach','/uploads/profile_picture-1744887968005-820279862.png','','2025-03-14 16:17:08','2025-04-17 11:06:08'),
(17,'niki@gmail.com','$2b$10$dXBjXvg8wY47LcarFgJLW.f25ABD2MzHwakEPCbu56tG0bNrLvZcW','Nikolay','Stefanov','2007-03-26','male','athlete','/uploads/profile_picture-1744478501316-897976693.jpg','0886704023','2025-03-30 12:22:57','2025-04-13 09:40:04'),
(18,'aleks@gmail.com','$2b$10$5/HUPs9JhmGKHbvMia0XNOMBWNUPWWnHqz3a5ie7sARW7a8ZxteA6','Aleksander','Stefanov','2011-03-12','male','athlete','/uploads/profile_picture/profile_picture-1744378239799-677977560.png','0886704023','2025-04-11 13:30:39','2025-04-12 18:05:40'),
(19,'aya@gmail.com','$2b$10$t6bPhuWUeE4VMAWfBgsULOtWluhx9bCA55fGKh6mWmtD5GNRXaf3y','Aya','Stefanova','2012-10-10','female','athlete','/uploads/profile_picture/profile_picture-1744378472551-82654147.png','0886704023','2025-04-11 13:34:32','2025-04-13 06:57:20'),
(20,'test@gmail.com','$2b$10$SINwOL7fWlI.Obr3eUPp9uw4/yLEtZZR.IieLVwBMgi.3l6poON76','test','test','2025-04-10','male','regular','/uploads/profile_picture/profile_picture-1744386198364-838355519.png','0886704023','2025-04-11 15:43:18','2025-04-11 15:43:18'),
(21,'passtest@gmail.com','$2b$10$pJkTtGD/9hKOnJGe2c9o5uC0OrRRb.lDMYUzMaOUAJ/fyDWAqK3Mi','Pass','test','2025-04-12','male','regular','/uploads/profile_picture/profile_picture-1744464961575-610311422.png','0886704023','2025-04-12 13:36:01','2025-04-12 13:36:38'),
(22,'nn@gmail.com','$2b$10$i.YUqX3xXqHJRIlTkth5c.vBB3m8.iyK/lTDO2Q8Bkp8P0bJp4/46','n','n','2025-04-03','male','regular','/uploads/profile_picture-1744468837461-749114702.png','0886704023','2025-04-12 13:46:17','2025-04-12 14:40:37'),
(23,'joinUser@gmail.com','$2b$10$8Fep7J9Wy2RtaDg4w3o80eBYNy/YdwxxqnZC3E1HtFh/cC.p1.YjC','test','joinrequste user','2025-04-11','male','athlete','/uploads/profile_picture-1744527864255-61705064.png','0886704023','2025-04-13 07:04:24','2025-04-13 07:29:55'),
(24,'a@gmail.com','$2b$10$V7gvg5B2f6TrLphYg1SQte7iQ4lV5cYgGGDar7997W6yWnqdZULXe','a','a','2025-04-09','male','athlete','/uploads/profile_picture-1744529714511-583363347.jpg','0886704023','2025-04-13 07:35:14','2025-04-13 07:35:38'),
(25,'s1@gmail.com','$2b$10$3s7xl3bZjiCAr/aae3RF3O9f5DdI6.1aD.JzhOgcKJZmskYsSDXIW','senior1','senior1','2006-02-02','male','regular','/uploads/profile_picture-1744714754369-936494281.png','0886704023','2025-04-15 10:59:14','2025-04-15 10:59:14'),
(26,'s2@gmail.com','$2b$10$Lh6koTnWoJpm79KrApqF.eA/IuLXo9fHeyTMBWRBpMUGbXlXq6jCe','senior2','senior2','2006-04-04','male','regular','/uploads/profile_picture-1744714873791-208765247.png','0886704023','2025-04-15 11:01:13','2025-04-15 11:01:13'),
(27,'s3@gmail.com','$2b$10$ygY3XBSmSAeM8/JDFOtHFeWjM.r79bxoEJfNmJTWwwJ1DpKgfo/7e','senior3','senior3','2006-02-02','male','regular','/uploads/profile_picture-1744714968149-289991685.png','0886704023','2025-04-15 11:02:48','2025-04-15 11:02:48'),
(28,'s4@gmail.com','$2b$10$bKfTJiGn/1X3IKwj7zx/DO/z.J6z7Sw9bRdHIo465GKOCco.5JrWW','senior4','senior4','2006-02-02','male','regular',NULL,'0886704023','2025-04-15 11:03:34','2025-04-15 11:03:34'),
(29,'sf@gmail.com','$2b$10$1wzUyvFmQp/sI3CNRh6/U.UnwO8XgRxxdR9g0zYWKOWc/VoeZJ9OG','senior female','senior female','2006-04-18','female','regular',NULL,'0886704023','2025-04-17 05:28:20','2025-04-17 05:28:20'),
(30,'sf2@gmail.com','$2b$10$1WXVzpTbvjPEw4chIYkYmu.ibx4yebAF.LhoXhnxT5FF1HTnhRxpm','senoir','female 2','2006-04-17','female','regular',NULL,'0886704023','2025-04-17 05:29:11','2025-04-17 05:29:11'),
(31,'sf3@gmail.com','$2b$10$wWfk9YP4Y7o3baR2kVHNhOdf2tiFVedzrZ2RvzthUk/gZUCOqHnO6','senior','female 3','2006-04-17','female','regular',NULL,'0886704023','2025-04-17 05:29:58','2025-04-17 05:29:58');
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

-- Dump completed on 2025-04-18 14:40:11
