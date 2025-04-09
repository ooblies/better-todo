USE master;

IF NOT EXISTS(SELECT * FROM sys.databases WHERE name = 'ToDo')
BEGIN 
	CREATE DATABASE ToDo;
END
GO

/*
IF NOT EXISTS(SELECT * FROM sys.schemas WHERE name = 'vw')
BEGIN 
	CREATE SCHEMA vw;
END
*/

USE ToDo;
GO


IF EXISTS( SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Category')
BEGIN
	IF EXISTS( SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ToDoItem')
	BEGIN
		DROP TABLE ToDoItem
	END

	DROP TABLE Category
END

CREATE TABLE Category (
	CategoryId INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
	Name NVARCHAR(10) NOT NULL,
	CreatedOn DATETIME DEFAULT GETDATE(),
	ModifiedOn DATETIME DEFAULT GETDATE()
);

INSERT INTO Category (Name)
VALUES ('Call'),
		('Cook'),
		('Daily'),
		('Date'),
		('Gar'),
		('Go'),
		('Hw'),
		('Out'),
		('Pw'),
		('Sys');

		
IF EXISTS( SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'Who')
BEGIN
	IF EXISTS( SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ToDoItem')
	BEGIN
		DROP TABLE ToDoItem
	END

	DROP TABLE Who
END

CREATE TABLE Who (
	WhoId INT IDENTITY(1,1) PRIMARY KEY NOT NULL,
	Name NVARCHAR(10) NOT NULL,
	CreatedOn DATETIME DEFAULT GETDATE(),
	ModifiedOn DATETIME DEFAULT GETDATE()
);

INSERT INTO Who (Name)
VALUES ('Beth'),
       ('David'),
	   ('Us')
	   
IF EXISTS( SELECT * FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_NAME = 'ToDoItem')
BEGIN
	DROP TABLE ToDoItem
END

CREATE TABLE ToDoItem (
	ItemId BIGINT IDENTITY(1,1) PRIMARY KEY NOT NULL,
	Name NVARCHAR(25) NULL,
	ItemDate Date NULL,
	WhoId INT FOREIGN KEY REFERENCES Who (WhoId),
	CategoryId INT FOREIGN KEY REFERENCES Category (CategoryId),
	Status NVARCHAR(25) NULL,
	Cost INT NULL,
	Notes NVARCHAR(50) NULL,
	Done BIT DEFAULT 0,
	CreatedOn DATETIME DEFAULT GETDATE(),
	ModifiedOn DATETIME DEFAULT GETDATE()
)

GO

INSERT INTO ToDoItem (Name, ItemDate, WhoId, CategoryId, Status, Cost, Notes, Done)
SELECT 'ToDo Item', GETDATE(), 1,1,'Status',1,'Notes',0;

INSERT INTO ToDoItem (Name, ItemDate, WhoId, CategoryId, Status, Cost, Notes, Done)
SELECT 'Done Item', GETDATE(), 1,1,'Status',1,'Notes',1;

GO
CREATE OR ALTER VIEW vw.TodaysItems AS (
	SELECT i.ItemId, i.Name, i.ItemDate, w.Name as Who, c.Name as Category, i.Status, i.Cost, i.Notes, i.Done
	FROM ToDoItem i
	LEFT JOIN Who w
		on i.WhoId = w.WhoId
	LEFT JOIN Category c
		on i.CategoryId = c.CategoryId
	WHERE ItemDate = CAST(GETDATE() AS DATE)
);

GO
CREATE OR ALTER VIEW vw.AllItems AS (
	SELECT i.ItemId, i.Name, i.ItemDate, w.Name as Who, c.Name as Category, i.Status, i.Cost, i.Notes, i.Done
	FROM ToDoItem i
	LEFT JOIN Who w
		on i.WhoId = w.WhoId
	LEFT JOIN Category c
		on i.CategoryId = c.CategoryId
);
GO

SELECT * FROM vw.AllItems;



SELECT TABLE_NAME AS name FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_SCHEMA = 'vw'