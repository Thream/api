-- All users have the password `test`
INSERT INTO `Users` (`id`, `name`, `email`, `password`, `status`, `biography`, `logo`, `isConfirmed`, `tempToken`, `tempExpirationToken`, `createdAt`, `updatedAt`) VALUES
(1, 'Divlo', 'contact@divlo.fr', '$2a$12$rdXfja1jtd88bgvKs4Pbl.yBBFJZP5Y0TcmqOCPm8Fy3BmQCnJHG2', '', '', '/uploads/users/default.png', 1, NULL, NULL, '2021-03-04 12:47:36', '2021-03-04 12:48:30'),
(2, 'Divlo2', 'divlogaming@gmail.com', '$2a$12$/aIvPyRbp/WUXN1FHwo0w.pBtT1dNls01L8SClpDXbBccjWD33trm', '', '', '/uploads/users/default.png', 1, NULL, NULL, '2021-03-04 12:47:53', '2021-03-04 12:48:32'),
(3, 'John Doe', 'johndoe@gmail.com', '$2a$12$3Qif9pviwoLLtTAQZqir7u4stLNU6E053EvDeso16aqvuahi7w1se', '', '', '/uploads/users/default.png', 1, NULL, NULL, '2021-03-04 12:48:24', '2021-03-04 12:48:35'),
(4, 'User', 'user@example.com', '$2a$12$SdgnEhy22aNQXwBRNDy/XeUNWLvu/MneA1Xfs2dtNhai.m/gP9xNi', '', '', '/uploads/users/default.png', 1, NULL, NULL, '2021-03-04 12:49:58', '2021-03-04 12:50:04');

INSERT INTO `UserSettings` (`id`, `language`, `theme`, `isPublicEmail`, `userId`, `createdAt`, `updatedAt`) VALUES
(1, 'en', 'dark', 0, 1, '2021-03-04 12:47:36', '2021-03-04 12:47:36'),
(2, 'fr', 'dark', 0, 2, '2021-03-04 12:47:53', '2021-03-04 12:47:53'),
(3, 'en', 'light', 0, 3, '2021-03-04 12:48:24', '2021-03-04 12:48:24'),
(4, 'fr', 'light', 0, 4, '2021-03-04 12:49:58', '2021-03-04 12:49:58');

INSERT INTO `Guilds` (`id`, `name`, `description`, `icon`, `isPublic`, `createdAt`, `updatedAt`) VALUES
(1, 'Ligue.dev', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:51:27', '2021-03-04 12:51:27'),
(2, 'Docstring', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:51:39', '2021-03-04 12:51:39'),
(3, 'Read The Docs', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:51:50', '2021-03-04 12:51:50'),
(4, 'Les Joies du Code', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:52:09', '2021-03-04 12:52:09'),
(5, 'Firecamp', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:52:19', '2021-03-04 12:52:19'),
(6, 'CodinGame', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:52:30', '2021-03-04 12:52:30'),
(7, 'Leon AI', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:52:38', '2021-03-04 12:52:38'),
(8, 'Academind', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:52:45', '2021-03-04 12:52:45'),
(9, 'StandardJS', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:52:57', '2021-03-04 12:52:57'),
(10, 'Next.js', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:53:08', '2021-03-04 12:53:08'),
(11, 'Tailwind CSS', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:54:58', '2021-03-04 12:54:58'),
(12, 'Vue Land', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:55:04', '2021-03-04 12:55:04'),
(13, 'Nuxt.js', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:55:11', '2021-03-04 12:55:11'),
(14, 'Reactiflux', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:55:16', '2021-03-04 12:55:16'),
(15, 'Deno', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:55:25', '2021-03-04 12:55:25'),
(16, 'fastify', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:55:33', '2021-03-04 12:55:33'),
(17, 'MandarineTS', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:55:48', '2021-03-04 12:55:48'),
(18, 'Olivia', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:55:56', '2021-03-04 12:55:56'),
(19, 'yarnpkg', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:56:19', '2021-03-04 12:56:19'),
(20, 'Qovery', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:56:25', '2021-03-04 12:56:25'),
(21, 'The Design Collective', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:56:46', '2021-03-04 12:56:46'),
(22, 'Tauri Apps', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:56:52', '2021-03-04 12:56:52'),
(23, 'microsoft-python', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:57:06', '2021-03-04 12:57:06'),
(24, 'AppBrewery', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:57:17', '2021-03-04 12:57:17'),
(25, 'OpenSauced', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:57:23', '2021-03-04 12:57:23'),
(26, 'Devsters', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:57:39', '2021-03-04 12:57:39'),
(27, 'Coding Roads', '', '/uploads/guilds/default.png', 0, '2021-03-04 12:57:49', '2021-03-04 12:57:49');

INSERT INTO `Channels` (`id`, `name`, `type`, `description`, `isDefault`, `guildId`, `createdAt`, `updatedAt`) VALUES
(1, 'general', 'text', '', 1, 1, '2021-03-04 12:51:27', '2021-03-04 12:51:27'),
(2, 'general', 'text', '', 1, 2, '2021-03-04 12:51:39', '2021-03-04 12:51:39'),
(3, 'general', 'text', '', 1, 3, '2021-03-04 12:51:50', '2021-03-04 12:51:50'),
(4, 'general', 'text', '', 1, 4, '2021-03-04 12:52:09', '2021-03-04 12:52:09'),
(5, 'general', 'text', '', 1, 5, '2021-03-04 12:52:19', '2021-03-04 12:52:19'),
(6, 'general', 'text', '', 1, 6, '2021-03-04 12:52:30', '2021-03-04 12:52:30'),
(7, 'general', 'text', '', 1, 7, '2021-03-04 12:52:38', '2021-03-04 12:52:38'),
(8, 'general', 'text', '', 1, 8, '2021-03-04 12:52:45', '2021-03-04 12:52:45'),
(9, 'general', 'text', '', 1, 9, '2021-03-04 12:52:57', '2021-03-04 12:52:57'),
(10, 'general', 'text', '', 1, 10, '2021-03-04 12:53:08', '2021-03-04 12:53:08'),
(11, 'general', 'text', '', 1, 11, '2021-03-04 12:54:58', '2021-03-04 12:54:58'),
(12, 'general', 'text', '', 1, 12, '2021-03-04 12:55:04', '2021-03-04 12:55:04'),
(13, 'general', 'text', '', 1, 13, '2021-03-04 12:55:11', '2021-03-04 12:55:11'),
(14, 'general', 'text', '', 1, 14, '2021-03-04 12:55:16', '2021-03-04 12:55:16'),
(15, 'general', 'text', '', 1, 15, '2021-03-04 12:55:26', '2021-03-04 12:55:26'),
(16, 'general', 'text', '', 1, 16, '2021-03-04 12:55:33', '2021-03-04 12:55:33'),
(17, 'general', 'text', '', 1, 17, '2021-03-04 12:55:48', '2021-03-04 12:55:48'),
(18, 'general', 'text', '', 1, 18, '2021-03-04 12:55:56', '2021-03-04 12:55:56'),
(19, 'general', 'text', '', 1, 19, '2021-03-04 12:56:19', '2021-03-04 12:56:19'),
(20, 'general', 'text', '', 1, 20, '2021-03-04 12:56:25', '2021-03-04 12:56:25'),
(21, 'general', 'text', '', 1, 21, '2021-03-04 12:56:46', '2021-03-04 12:56:46'),
(22, 'general', 'text', '', 1, 22, '2021-03-04 12:56:52', '2021-03-04 12:56:52'),
(23, 'general', 'text', '', 1, 23, '2021-03-04 12:57:06', '2021-03-04 12:57:06'),
(24, 'general', 'text', '', 1, 24, '2021-03-04 12:57:17', '2021-03-04 12:57:17'),
(25, 'general', 'text', '', 1, 25, '2021-03-04 12:57:23', '2021-03-04 12:57:23'),
(26, 'general', 'text', '', 1, 26, '2021-03-04 12:57:39', '2021-03-04 12:57:39'),
(27, 'general', 'text', '', 1, 27, '2021-03-04 12:57:49', '2021-03-04 12:57:49');

INSERT INTO `Invitations` (`id`, `value`, `expiresIn`, `isPublic`, `guildId`, `createdAt`, `updatedAt`) VALUES
(1, 'firstinvitation', 0, 1, 1, '2021-03-04 13:09:06', '2021-03-04 13:09:06');

INSERT INTO `Members` (`id`, `isOwner`, `lastVisitedChannelId`, `userId`, `guildId`, `createdAt`, `updatedAt`) VALUES
(1, 1, 1, 1, 1, '2021-03-04 12:51:27', '2021-03-04 12:51:27'),
(2, 1, 2,  1, 2, '2021-03-04 12:51:39', '2021-03-04 12:51:39'),
(3, 1, 3, 1, 3, '2021-03-04 12:51:50', '2021-03-04 12:51:50'),
(4, 1, 4, 1, 4, '2021-03-04 12:52:09', '2021-03-04 12:52:09'),
(5, 1, 5, 1, 5, '2021-03-04 12:52:19', '2021-03-04 12:52:19'),
(6, 1, 6, 1, 6, '2021-03-04 12:52:30', '2021-03-04 12:52:30'),
(7, 1, 7, 1, 7, '2021-03-04 12:52:38', '2021-03-04 12:52:38'),
(8, 1, 8, 1, 8, '2021-03-04 12:52:45', '2021-03-04 12:52:45'),
(9, 1, 9, 1, 9, '2021-03-04 12:52:57', '2021-03-04 12:52:57'),
(10, 1, 10, 1, 10, '2021-03-04 12:53:08', '2021-03-04 12:53:08'),
(11, 1, 11, 1, 11, '2021-03-04 12:54:58', '2021-03-04 12:54:58'),
(12, 1, 12, 1, 12, '2021-03-04 12:55:04', '2021-03-04 12:55:04'),
(13, 1, 13, 1, 13, '2021-03-04 12:55:11', '2021-03-04 12:55:11'),
(14, 1, 14, 1, 14, '2021-03-04 12:55:16', '2021-03-04 12:55:16'),
(15, 1, 15, 1, 15, '2021-03-04 12:55:26', '2021-03-04 12:55:26'),
(16, 1, 16, 1, 16, '2021-03-04 12:55:33', '2021-03-04 12:55:33'),
(17, 1, 17, 1, 17, '2021-03-04 12:55:48', '2021-03-04 12:55:48'),
(18, 1, 18, 1, 18, '2021-03-04 12:55:56', '2021-03-04 12:55:56'),
(19, 1, 19, 1, 19, '2021-03-04 12:56:19', '2021-03-04 12:56:19'),
(20, 1, 20, 1, 20, '2021-03-04 12:56:25', '2021-03-04 12:56:25'),
(21, 1, 21, 1, 21, '2021-03-04 12:56:46', '2021-03-04 12:56:46'),
(22, 1, 22, 1, 22, '2021-03-04 12:56:52', '2021-03-04 12:56:52'),
(23, 1, 23, 1, 23, '2021-03-04 12:57:06', '2021-03-04 12:57:06'),
(24, 1, 24, 1, 24, '2021-03-04 12:57:17', '2021-03-04 12:57:17'),
(25, 1, 25, 1, 25, '2021-03-04 12:57:23', '2021-03-04 12:57:23'),
(26, 1, 26, 1, 26, '2021-03-04 12:57:39', '2021-03-04 12:57:39'),
(27, 1, 27, 1, 27, '2021-03-04 12:57:49', '2021-03-04 12:57:49');

INSERT INTO `Messages` (`id`, `value`, `type`, `mimetype`, `memberId`, `channelId`, `createdAt`, `updatedAt`) VALUES
(1, 'Hello world!', 'text', 'text/plain', 1, 1, '2021-03-04 13:08:22', '2021-03-04 13:08:22');
