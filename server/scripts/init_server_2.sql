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
	CREATE SCHEMA sproc;
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
	SELECT i.ItemId, i.Name, i.ItemDate, i.WhoId, i.CategoryId, i.Status, i.Cost, i.Notes, i.Done
	FROM ToDoItem i
	LEFT JOIN Who w
		on i.WhoId = w.WhoId
	LEFT JOIN Category c
		on i.CategoryId = c.CategoryId
	WHERE ItemDate = CAST(GETDATE() AS DATE)
);

GO
CREATE OR ALTER VIEW vw.AllItems AS (
	SELECT i.ItemId, i.Name, i.ItemDate, i.WhoId, i.CategoryId, i.Status, i.Cost, i.Notes, i.Done
	FROM ToDoItem i
	LEFT JOIN Who w
		on i.WhoId = w.WhoId
	LEFT JOIN Category c
		on i.CategoryId = c.CategoryId
);
GO

CREATE OR ALTER PROCEDURE sproc.MovePreviousUnfinishedToToday
AS
BEGIN
	UPDATE ToDoItem
	SET ItemDate = GETDATE(),
		ModifiedOn = GETDATE()
	WHERE Done = 0
	AND ItemDate < GETDATE()
END
GO

CREATE OR ALTER VIEW vw.Who AS (
	SELECT WhoId, Name
	FROM dbo.Who
);
GO
CREATE OR ALTER VIEW vw.Category AS (
	SELECT CategoryId, Name
	FROM dbo.Category
);
GO

CREATE OR ALTER VIEW vw.Unfinished AS (
	SELECT i.ItemId, i.Name, i.ItemDate, i.WhoId, i.CategoryId, i.Status, i.Cost, i.Notes, i.Done
	FROM ToDoItem i
	WHERE Done IS NULL OR Done = 0
)
GO

CREATE SCHEMA meta;

CREATE TABLE meta.views (
	Name VARCHAR(255),
	DisplayName VARCHAR(255),
	Count INT,
	Updateable BIT DEFAULT 0,
	UpdateTarget NVARCHAR(255) DEFAULT NULL,
	UpdateKey NVARCHAR(255) DEFAULT NULL,
	SortOrder INT

)
GO

-- SPROCs

CREATE OR ALTER PROCEDURE sproc.MovePreviousUnfinishedToToday
AS
BEGIN
	UPDATE ToDoItem
	SET ItemDate = GETDATE(),
		ModifiedOn = GETDATE()
	WHERE Done IS NULL OR DONE = 0
	AND ItemDate < GETDATE()
END
GO


CREATE OR ALTER PROCEDURE meta.UpdateMetadataAndListViews AS 
BEGIN
	DECLARE @View nvarchar(255)

	DECLARE view_cursor CURSOR FOR SELECT TABLE_NAME AS name FROM INFORMATION_SCHEMA.VIEWS WHERE TABLE_SCHEMA = 'vw'
	OPEN view_cursor
	FETCH NEXT FROM view_cursor
	INTO @View

	WHILE @@FETCH_STATUS = 0
	BEGIN

		DECLARE @count INT
		DECLARE @count_sql NVARCHAR(255) = 'SELECT @count_out = COUNT(*) FROM vw.' + @view
		DECLARE @sql_param NVARCHAR(255) = '@count_out INT OUTPUT'

		EXECUTE sp_executesql @count_sql, @sql_param, @count_out = @count OUTPUT

		MERGE meta.views as t
		USING (SELECT @view as name, @count as count) AS s
			ON t.name = s.name
		WHEN MATCHED
			THEN UPDATE
				 SET count = @count
		WHEN NOT MATCHED BY TARGET
			THEN
				INSERT (name, displayname, count, sortOrder)
				VALUES (@view, @view, @count, (SELECT COUNT(*) + 1 FROM meta.views));
	
		FETCH NEXT FROM view_cursor
		INTO @View
	END
	CLOSE view_cursor
	DEALLOCATE view_cursor

	SELECT * FROM meta.views
END