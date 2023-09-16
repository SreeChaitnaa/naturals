import logging

import pyodbc
import os
from LSASCA.Utils import *


class SQLDB(object):
    def __init__(self):
        con_string = "Driver={SQL Server Native Client 11.0};Trusted_Connection=yes;"
        con_string += "Server={0};Database={1};uid={2};pwd={3}".format(Strings.sql_server, Strings.sql_db_name,
                                                                       Strings.sql_user, Strings.sql_password)
        self.sql_connection = pyodbc.connect(con_string)

    def run_sql_query(self, query):
        return self.sql_connection.cursor().execute(query)

    def get_all_ticket_tables(self):
        return self.get_all_tables_with_given_column(Strings.ticket_id)

    def get_all_table_names(self):
        query = "SELECT name FROM sys.tables"
        return [row["name"] for row in self.read_sql_query(query)]

    def get_client_count(self):
        return self.read_sql_query("select count(*) from dbo.client")[0][""]

    def get_all_tables_with_given_column(self, column_name):
        query = "SELECT tab.name as table_name " \
                "FROM sys.tables as tab " \
                "INNER JOIN sys.columns as col " \
                "on tab.object_id = col.object_id " \
                "LEFT JOIN sys.types as t " \
                "on col.user_type_id = t.user_type_id " \
                "WHERE col.name like '%{}%'".format(column_name.lower())
        return [row["table_name"] for row in self.read_sql_query(query)]

    def read_sql_query(self, query):
        cursor = self.run_sql_query(query)
        columns = [column[0] for column in cursor.description]
        results = []
        for row in cursor.fetchall():
            results.append(dict(zip(columns, row)))
        return results

    def get_new_bills(self, last_bill):
        query = "select {0} from {1} where {0} > {2}".format(Strings.ticket_id, Strings.ticket_table, last_bill)
        new_bill_numbers = [row[Strings.ticket_id] for row in self.read_sql_query(query)]
        new_bills = {}
        for new_bill_no in new_bill_numbers:
            new_bills[new_bill_no] = self.get_bill_data_from_all_tables(new_bill_no)
        return new_bills

    def get_bill_data_from_all_tables(self, bill_no):
        bill_data = {}
        for tab_name in self.get_all_ticket_tables():
            bill_rows = self.read_sql_query(
                "select * from {0} where {1}={2}".format(tab_name, Strings.ticket_id.lower(), bill_no))
            if bill_rows:
                bill_data[tab_name] = bill_rows
        return bill_data

