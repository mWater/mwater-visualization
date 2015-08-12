var Schema, SchemaBuilder,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Schema = require('../../Schema');

module.exports = SchemaBuilder = (function() {
  function SchemaBuilder() {}

  SchemaBuilder.prototype.addEntities = function(schema, entityTypes, properties, units, user, groups) {
    var entityType, i, j, k, knownProps, len, len1, len2, prop, ref, reverseJoins, rj, tableId;
    reverseJoins = [];
    for (i = 0, len = entityTypes.length; i < len; i++) {
      entityType = entityTypes[i];
      tableId = "entities." + entityType.code;
      schema.addTable({
        id: tableId,
        name: entityType.name.en,
        ordering: "_created_on"
      });
      knownProps = ['type', 'code', 'name', 'desc', 'location'];
      properties = _.sortBy(properties, function(p) {
        if (_.contains(knownProps, p.code)) {
          return _.indexOf(knownProps, p.code);
        } else {
          return 9999;
        }
      });
      for (j = 0, len1 = properties.length; j < len1; j++) {
        prop = properties[j];
        if (!_.any(prop._roles, function(r) {
          var ref;
          if (r.to === "all") {
            return true;
          }
          if (r.to === ("user:" + user)) {
            return true;
          }
          if (ref = r.to, indexOf.call(_.map(groups || [], function(g) {
            return "group:" + g;
          }), ref) >= 0) {
            return true;
          }
          return false;
        })) {
          continue;
        }
        if (prop.entity_type !== entityType.code) {
          continue;
        }
        if (prop.type === "measurement") {
          schema.addColumn(tableId, {
            id: prop.code + ".magnitude",
            name: prop.name.en + " (magnitude)",
            type: "decimal"
          });
          schema.addColumn(tableId, {
            id: prop.code + ".unit",
            name: prop.name.en + " (units)",
            type: "enum",
            values: _.map(prop.units, function(u) {
              return {
                id: u,
                name: _.findWhere(units, {
                  code: u
                }).name.en
              };
            })
          });
        } else if (prop.type === "entity") {
          schema.addColumn(tableId, {
            id: tableId + "." + prop.code,
            name: prop.name.en,
            type: "join",
            join: {
              fromTable: tableId,
              fromColumn: prop.code,
              toTable: "entities." + prop.ref_entity_type,
              toColumn: "_id",
              op: "=",
              multiple: false
            }
          });
          reverseJoins.push({
            table: tableId,
            column: {
              id: "!" + tableId + "." + prop.code,
              name: entityType.name.en,
              type: "join",
              join: {
                fromTable: "entities." + prop.ref_entity_type,
                fromColumn: "_id",
                toTable: tableId,
                toColumn: prop.code,
                op: "=",
                multiple: true
              }
            }
          });
        } else if (prop.type === "enum") {
          schema.addColumn(tableId, {
            id: prop.code,
            name: prop.name.en,
            type: prop.type,
            values: _.map(prop.values, function(v) {
              return {
                id: v.code,
                name: v.name.en
              };
            })
          });
        } else if ((ref = prop.type) !== 'json' && ref !== 'image' && ref !== 'imagelist') {
          schema.addColumn(tableId, {
            id: prop.code,
            name: prop.name.en,
            type: prop.type,
            values: prop.values
          });
        }
      }
      schema.addColumn(tableId, {
        id: "_created_by",
        name: "Created by user",
        type: "text"
      });
      schema.addColumn(tableId, {
        id: "_created_for",
        name: "Created by group",
        type: "text"
      });
      if (entityType.code === "water_point") {
        schema.addColumn(tableId, {
          id: "wpdx.management",
          name: "Management (WPDX)",
          type: "enum",
          values: [
            {
              id: "Community Management",
              name: "Community Management"
            }, {
              id: "Private Operator/Delegated Management",
              name: "Private Operator/Delegated Management"
            }, {
              id: "Institutional Management",
              name: "Institutional Management"
            }, {
              id: "Other",
              name: "Other"
            }, {
              id: "Direct Government Operation",
              name: "Direct Government Operation"
            }
          ]
        });
        schema.addColumn(tableId, {
          id: "wpdx.install_year",
          name: "Install Year (WPDX)",
          type: "integer"
        });
      }
    }
    for (k = 0, len2 = reverseJoins.length; k < len2; k++) {
      rj = reverseJoins[k];
      schema.addColumn(rj.table, rj.column);
    }
    schema.addNamedExpr("entities.water_point", {
      id: "Water Point Type",
      name: "Water Point Type",
      expr: {
        type: "field",
        table: "entities.water_point",
        column: "type"
      }
    });
    schema.addNamedExpr("entities.water_point", {
      id: "Functional Status",
      name: "Functional Status",
      expr: {
        type: "scalar",
        table: "entities.water_point",
        joins: ["source_notes"],
        aggr: "last",
        expr: {
          type: "field",
          table: "source_notes",
          column: "status"
        }
      }
    });
    return schema.setTableStructure("entities.water_point", Schema.parseStructureFromText('type Type\nmwa_scheme_type MWA scheme type\n\n+Name and location data\n  name Name\n  desc Description\n  location Location\n  location_accuracy Location Accuracy\n  location_altitude Location Altitude\n  admin_02_country Country\n  admin_08_ethiopia_woreda Woreda\n  admin_10_ethiopia_kebele Kebele\n  photos Photos\n\n+Technical attributes\n  installation_date Date of installation\n  supply Supply\n  supply_other Supply (other)\n  treatment_works Treatment works\n  drilling_method Drilling method\n  drilling_method_other Drilling method (other)\n  pump_lifting_device Pump/lifting device\n  pump_lifting_device_other Pump lifting device (Other)\n  rehab Rehabilitated water point\n\n+Identification codes\n  code mWater Code\n  the_water_trust_uganda_id The Water Trust Uganda Id\n  oxfam_south_sudan_id Oxfam South Sudan Id\n  charity_water_id charity: water Id\n  tz_wpms_id Tz-WPMS Id\n\n+Program and funding data\n  wo_initiative Water.org Initiative\n  wo_partner_name Water.org Partner Name\n  wo_program_number Water.org Program Number\n  wo_program_type Water.org Program Type\n  twp_partner TWP Partner\n  twp_project_id TWP Project ID\n  twp_project_location TWP Project Location\n  twp_project_type TWP Project Type\n  twp_url TWP Project Link\n\n+Other\n  legacy_attrs Attributes\n  legacy_custom Custom Fields\n  legacy_tags Tags\n\n+Water Point Data Exchange (WPDX)\n  wpdx_converted_fields WPDX Converted fields\n  wpdx_country WPDX Country (ISO 2-letter code)\n  wpdx_data_source WPDX Data source\n  wpdx_id WPDX Water point ID\n  wpdx_installer WPDX Installer\n  wpdx_management_structure WPDX Management structure\n  wpdx_primary_admin_div WPDX Primary administrative division\n  wpdx_raw_data_source_url WPDX Raw data source URL\n  wpdx_secondary_admin_div WPDX Secondary administrative division\n  wpdx_water_point_technology WPDX Water point technology\n  wpdx_water_source WPDX Water Source'));
  };

  SchemaBuilder.prototype.addLegacyTables = function(schema) {
    schema.addTable({
      id: "source_notes",
      name: "Functionality Reports",
      ordering: "date"
    });
    schema.addColumn("source_notes", {
      id: "source",
      name: "Water Point Code",
      type: "text"
    });
    schema.addColumn("source_notes", {
      id: "date",
      name: "Report Date",
      type: "date"
    });
    schema.addColumn("source_notes", {
      id: "status",
      name: "Functional Status",
      type: "enum",
      values: [
        {
          id: 'ok',
          name: 'Functional'
        }, {
          id: 'maint',
          name: 'Needs maintenance'
        }, {
          id: 'broken',
          name: 'Non-functional'
        }, {
          id: 'missing',
          name: 'No longer exists'
        }
      ]
    });
    schema.addColumn("source_notes", {
      id: "notes",
      name: "Notes",
      type: "text"
    });
    return schema.addColumn("entities.water_point", {
      id: "source_notes",
      name: "Functional Reports",
      type: "join",
      join: {
        fromTable: "entities.water_point",
        fromColumn: "code",
        toTable: "source_notes",
        toColumn: "source",
        op: "=",
        multiple: true
      }
    });
  };

  return SchemaBuilder;

})();
