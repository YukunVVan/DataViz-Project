shp2pgsql -I -W "latin1" -s 4326 -d -g the_geom new_tree_request.shp tableTree |psql -U vistest -p 5432 -h newtree.cauuh8vzeelb.us-east-1.rds.amazonaws.com dbNewTree
