/* Set of functions in PostgreSQL to convert from hex/square coordinates to xy and to make hexagons/squares */

/* Convert a column (q) and row (r) of hex coordinates to the center point. Size is distance from center to point */
create or replace function mwater_hex_qr_to_xy (q integer, r integer, size numeric) 
   returns table(x double precision, y double precision)
as $$
begin
   return query select (size * 3.0/2 * q)::double precision as x, (size * sqrt(3) * (r + 0.5 * (mod(q,2))))::double precision as y;
end; $$ 
language 'plpgsql';

/* Convert a column (q) and row (r) of square grid coordinates to the center point. Size is distance from center to center */
create or replace function mwater_square_qr_to_xy (q integer, r integer, size numeric) 
   returns table(x double precision, y double precision)
as $$
begin
   return query select (size * q)::double precision as x, (size * r)::double precision as y;
end; $$ 
language 'plpgsql';

/* Convert an x, y point to hex row (r) and column (q) https://www.redblobgames.com/grids/hexagons/#rounding */
create or replace function mwater_hex_xy_to_qr (x double precision, y double precision, size numeric) 
  returns table(q integer, r integer)
as $$
declare 
  q double precision;
  r double precision;
  cx double precision;
  cy double precision;
  cz double precision;
  rx integer;
  ry integer;
  rz integer;
  x_diff double precision;
  y_diff double precision;
  z_diff double precision;
begin
  q := (2.0/3 * x)/size;
  /* r := (-1.0/3 * x + sqrt(3)/3 * y)/size; */
  r := (-1.0/3 * x + 0.577350269 * y)/size;

  cx := q;
  cy := -q-r;
  cz := r;

  rx := round(cx);
  ry := round(cy);
  rz := round(cz);

  x_diff := abs(rx - cx);
  y_diff := abs(ry - cy);
  z_diff := abs(rz - cz);

  if x_diff > y_diff and x_diff > z_diff then
    rx := -ry-rz;
  elsif y_diff > z_diff then
    ry := -rx-rz;
  else
    rz := -rx-ry;
  end if;

  return query select rx as q, rz + (rx - mod(rx, 2)) / 2 as r;
end; $$ 
language 'plpgsql';

/* Convert an x, y point to square row (r) and column (q)*/
create or replace function mwater_square_xy_to_qr (x double precision, y double precision, size numeric) 
  returns table(q integer, r integer)
as $$
begin
  return query select round(x/size)::integer as q, round(y/size)::integer as r;
end; $$ 
language 'plpgsql';

/* Make a hexagon at column q and row r */
create or replace function mwater_hex_make (q integer, r integer, size decimal) 
  returns geometry
as $$
declare 
  xy record;
  p1 geometry;
  p2 geometry;
  p3 geometry;
  p4 geometry;
  p5 geometry;
  p6 geometry;
begin
  /* Find center point */
  xy := mwater_hex_qr_to_xy(q, r, size);

  /* Make points of corners */
  p1 := ST_SetSRID(ST_MakePoint(xy.x + size * 1, xy.y + size * 0), 3857);
  p2 := ST_SetSRID(ST_MakePoint(xy.x + size * 0.5, xy.y + size * 0.866025403784439), 3857);
  p3 := ST_SetSRID(ST_MakePoint(xy.x + size * -0.5, xy.y + size * 0.866025403784439), 3857);
  p4 := ST_SetSRID(ST_MakePoint(xy.x + size * -1, xy.y + size * 0), 3857);
  p5 := ST_SetSRID(ST_MakePoint(xy.x + size * -0.5, xy.y + size * -0.866025403784438), 3857);
  p6 := ST_SetSRID(ST_MakePoint(xy.x + size * 0.5, xy.y + size * -0.866025403784439), 3857);

  /* Convert to polygon */
  return ST_MakePolygon(ST_MakeLine(ARRAY[p1, p2, p3, p4, p5, p6, p1]));
end; $$ 
language 'plpgsql';

/* Make a square at column q and row r */
create or replace function mwater_square_make (q integer, r integer, size decimal) 
  returns geometry
as $$
declare 
  xy record;
  p1 geometry;
  p2 geometry;
  p3 geometry;
  p4 geometry;
begin
  /* Find center point */
  xy := mwater_square_qr_to_xy(q, r, size);

  /* Make points of corners */
  p1 := ST_SetSRID(ST_MakePoint(xy.x + size * 0.5, xy.y + size * 0.5), 3857);
  p2 := ST_SetSRID(ST_MakePoint(xy.x + size * 0.5, xy.y - size * 0.5), 3857);
  p3 := ST_SetSRID(ST_MakePoint(xy.x - size * 0.5, xy.y - size * 0.5), 3857);
  p4 := ST_SetSRID(ST_MakePoint(xy.x - size * 0.5, xy.y + size * 0.5), 3857);

  /* Convert to polygon */
  return ST_MakePolygon(ST_MakeLine(ARRAY[p1, p2, p3, p4, p1]));
end; $$ 
language 'plpgsql';

/* Create a grid of hexagons that fill the extent (and a bit more) */
create or replace function mwater_hex_grid (extent geometry, size decimal) 
   returns table (
      q int,
      r int
   ) 
as $$
declare 
  minqr record;
  maxqr record;
begin
  /* Get top left corner q and r */
  minqr := mwater_hex_xy_to_qr(st_xmin(extent), st_ymin(extent), size);
  maxqr := mwater_hex_xy_to_qr(st_xmax(extent), st_ymax(extent), size);

  /* Generate grid (with padding) */
  return query select qseries as q, rseries as r from generate_series(minqr.q - 2, maxqr.q + 2) as qseries, generate_series(minqr.r - 2, maxqr.r + 2) as rseries;
end; $$ 
language 'plpgsql';

/* Create a grid of squares that fill the extent (and a bit more) */
create or replace function mwater_square_grid (extent geometry, size decimal) 
   returns table (
      q int,
      r int
   ) 
as $$
declare 
  minqr record;
  maxqr record;
begin
  /* Get top left corner q and r */
  minqr := mwater_square_xy_to_qr(st_xmin(extent), st_ymin(extent), size);
  maxqr := mwater_square_xy_to_qr(st_xmax(extent), st_ymax(extent), size);

  /* Generate grid (with padding) */
  return query select qseries as q, rseries as r from generate_series(minqr.q - 1, maxqr.q + 1) as qseries, generate_series(minqr.r - 1, maxqr.r + 1) as rseries;
end; $$ 
language 'plpgsql';
