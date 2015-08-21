var Schema, SchemaBuilder, formUtils, fs,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

Schema = require('../../Schema');

fs = require('fs');

formUtils = require('mwater-forms/lib/formUtils');

module.exports = SchemaBuilder = (function() {
  function SchemaBuilder(schema) {
    this.schema = schema;
  }

  SchemaBuilder.prototype.addEntities = function(entityTypes, properties, units, user, groups) {
    var entityType, i, j, k, len, len1, len2, prop, ref, reverseJoins, rj, tableId;
    reverseJoins = [];
    for (i = 0, len = entityTypes.length; i < len; i++) {
      entityType = entityTypes[i];
      tableId = "entities." + entityType.code;
      this.schema.addTable({
        id: tableId,
        name: entityType.name.en,
        ordering: "_created_on"
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
          this.schema.addColumn(tableId, {
            id: prop.code + ".magnitude",
            name: prop.name.en + " (magnitude)",
            type: "decimal"
          });
          this.schema.addColumn(tableId, {
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
          this.schema.addColumn(tableId, {
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
          this.schema.addColumn(tableId, {
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
          this.schema.addColumn(tableId, {
            id: prop.code,
            name: prop.name.en,
            type: prop.type,
            values: prop.values
          });
        }
      }
      this.schema.addColumn(tableId, {
        id: "_created_by",
        name: "Created by user",
        type: "text"
      });
      this.schema.addColumn(tableId, {
        id: "_created_for",
        name: "Created by group",
        type: "text"
      });
      this.schema.addColumn(tableId, {
        id: "_created_on",
        name: "Creation date",
        type: "datetime"
      });
      if (entityType.code === "water_point") {
        this.schema.addColumn(tableId, {
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
        this.schema.addColumn(tableId, {
          id: "wpdx.install_year",
          name: "Install Year (WPDX)",
          type: "integer"
        });
      }
    }
    for (k = 0, len2 = reverseJoins.length; k < len2; k++) {
      rj = reverseJoins[k];
      this.schema.addColumn(rj.table, rj.column);
    }
    this.schema.addNamedExpr("entities.water_point", {
      id: "Water Point Type",
      name: "Water Point Type",
      expr: {
        type: "field",
        table: "entities.water_point",
        column: "type"
      }
    });
    this.schema.addNamedExpr("entities.water_point", {
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
    return this.schema.setTableStructure("entities.water_point", Schema.parseStructureFromText(fs.readFileSync(__dirname + '/structures/water_point.txt', 'utf-8')));
  };

  SchemaBuilder.prototype.addLegacyTables = function() {
    this.schema.addTable({
      id: "source_notes",
      name: "Functionality Reports",
      ordering: "date"
    });
    this.schema.addColumn("source_notes", {
      id: "source",
      name: "Water Point Code",
      type: "text"
    });
    this.schema.addColumn("source_notes", {
      id: "date",
      name: "Report Date",
      type: "date"
    });
    this.schema.addColumn("source_notes", {
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
    this.schema.addColumn("source_notes", {
      id: "notes",
      name: "Notes",
      type: "text"
    });
    return this.schema.addColumn("entities.water_point", {
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

  SchemaBuilder.prototype.addForm = function(form) {
    var structure;
    this.schema.addTable({
      id: "form:" + form._id,
      name: formUtils.localizeString(form.design.name),
      jsonql: {
        type: "query",
        selects: [
          {
            type: "select",
            expr: {
              type: "field",
              tableAlias: "responses",
              column: "data"
            },
            alias: "data"
          }, {
            type: "select",
            expr: {
              type: "field",
              tableAlias: "responses",
              column: "deployment"
            },
            alias: "deployment"
          }, {
            type: "select",
            expr: {
              type: "field",
              tableAlias: "responses",
              column: "submittedOn"
            },
            alias: "submittedOn"
          }
        ],
        from: {
          type: "table",
          table: "responses",
          alias: "responses"
        },
        where: {
          type: "op",
          op: "=",
          exprs: [
            {
              type: "field",
              tableAlias: "responses",
              column: "form"
            }, form._id
          ]
        }
      }
    });
    structure = [];
    this.addFormItem(form, form.design, structure);
    return this.schema.setTableStructure("form:" + form._id, structure);
  };

  SchemaBuilder.prototype.addFormItem = function(form, item, structure) {
    var addColumn, answerType, choice, column, i, j, k, len, len1, len2, name, ref, ref1, ref2, results, results1, sectionStructure, subitem;
    addColumn = (function(_this) {
      return function(column) {
        _this.schema.addColumn("form:" + form._id, column);
        return structure.push({
          type: "column",
          column: column.id
        });
      };
    })(this);
    if (item.contents) {
      if (item._type === "Form") {
        ref = item.contents;
        results = [];
        for (i = 0, len = ref.length; i < len; i++) {
          subitem = ref[i];
          results.push(this.addFormItem(form, subitem, structure));
        }
        return results;
      } else if (item._type === "Section") {
        sectionStructure = [];
        ref1 = item.contents;
        for (j = 0, len1 = ref1.length; j < len1; j++) {
          subitem = ref1[j];
          this.addFormItem(form, subitem, sectionStructure);
        }
        return structure.push({
          type: "section",
          name: formUtils.localizeString(item.name),
          contents: sectionStructure
        });
      }
    } else if (formUtils.isQuestion(item)) {
      answerType = formUtils.getAnswerType(item);
      switch (answerType) {
        case "text":
          column = {
            id: "data:" + item._id + ":value",
            type: "text",
            name: formUtils.localizeString(item.text),
            jsonql: {
              type: "op",
              op: "#>>",
              exprs: [
                {
                  type: "field",
                  tableAlias: "{alias}",
                  column: "data"
                }, "{" + item._id + ",value}"
              ]
            }
          };
          return addColumn(column);
        case "number":
          if (item.decimal) {
            column = {
              id: "data:" + item._id + ":value",
              type: "decimal",
              name: formUtils.localizeString(item.text),
              jsonql: {
                type: "op",
                op: "::decimal",
                exprs: [
                  {
                    type: "op",
                    op: "#>>",
                    exprs: [
                      {
                        type: "field",
                        tableAlias: "{alias}",
                        column: "data"
                      }, "{" + item._id + ",value}"
                    ]
                  }
                ]
              }
            };
          } else {
            column = {
              id: "data:" + item._id + ":value",
              type: "integer",
              name: formUtils.localizeString(item.text),
              jsonql: {
                type: "op",
                op: "::integer",
                exprs: [
                  {
                    type: "op",
                    op: "#>>",
                    exprs: [
                      {
                        type: "field",
                        tableAlias: "{alias}",
                        column: "data"
                      }, "{" + item._id + ",value}"
                    ]
                  }
                ]
              }
            };
          }
          return addColumn(column);
        case "choice":
          column = {
            id: "data:" + item._id + ":value",
            type: "enum",
            name: formUtils.localizeString(item.text),
            jsonql: {
              type: "op",
              op: "#>>",
              exprs: [
                {
                  type: "field",
                  tableAlias: "{alias}",
                  column: "data"
                }, "{" + item._id + ",value}"
              ]
            },
            values: _.map(item.choices, function(c) {
              return {
                id: c.id,
                name: formUtils.localizeString(c.label)
              };
            })
          };
          return addColumn(column);
        case "choices":
          ref2 = item.choices;
          results1 = [];
          for (k = 0, len2 = ref2.length; k < len2; k++) {
            choice = ref2[k];
            column = {
              id: "data:" + item._id + ":value:" + choice.id,
              type: "boolean",
              name: formUtils.localizeString(item.text) + ": " + formUtils.localizeString(choice.label),
              jsonql: {
                type: "op",
                op: "like",
                exprs: [
                  {
                    type: "op",
                    op: "#>>",
                    exprs: [
                      {
                        type: "field",
                        tableAlias: "{alias}",
                        column: "data"
                      }, "{" + item._id + ",value}"
                    ]
                  }, "%\"" + choice.id + "\"%"
                ]
              }
            };
            results1.push(addColumn(column));
          }
          return results1;
          break;
        case "date":
          column = {
            id: "data:" + item._id + ":value",
            type: "date",
            name: formUtils.localizeString(item.text),
            jsonql: {
              type: "op",
              op: "substr",
              exprs: [
                {
                  type: "op",
                  op: "rpad",
                  exprs: [
                    {
                      type: "op",
                      op: "#>>",
                      exprs: [
                        {
                          type: "field",
                          tableAlias: "{alias}",
                          column: "data"
                        }, "{" + item._id + ",value}"
                      ]
                    }, 10, '-01-01'
                  ]
                }, 1, 10
              ]
            }
          };
          return addColumn(column);
        case "boolean":
          column = {
            id: "data:" + item._id + ":value",
            type: "boolean",
            name: formUtils.localizeString(item.text),
            jsonql: {
              type: "op",
              op: "::boolean",
              exprs: [
                {
                  type: "op",
                  op: "#>>",
                  exprs: [
                    {
                      type: "field",
                      tableAlias: "{alias}",
                      column: "data"
                    }, "{" + item._id + ",value}"
                  ]
                }
              ]
            }
          };
          return addColumn(column);
        case "units":
          name = formUtils.localizeString(item.text);
          if (item.units.length > 1) {
            name += " (magnitude)";
          } else {
            name += " (" + (formUtils.localizeString(item.units[0].label)) + ")";
          }
          if (item.decimal) {
            column = {
              id: "data:" + item._id + ":value:quantity",
              type: "decimal",
              name: name,
              jsonql: {
                type: "op",
                op: "::decimal",
                exprs: [
                  {
                    type: "op",
                    op: "#>>",
                    exprs: [
                      {
                        type: "field",
                        tableAlias: "{alias}",
                        column: "data"
                      }, "{" + item._id + ",value,quantity}"
                    ]
                  }
                ]
              }
            };
          } else {
            column = {
              id: "data:" + item._id + ":value:quantity",
              type: "integer",
              name: name,
              jsonql: {
                type: "op",
                op: "::integer",
                exprs: [
                  {
                    type: "op",
                    op: "#>>",
                    exprs: [
                      {
                        type: "field",
                        tableAlias: "{alias}",
                        column: "data"
                      }, "{" + item._id + ",value,quantity}"
                    ]
                  }
                ]
              }
            };
          }
          addColumn(column);
          if (item.units.length > 1) {
            column = {
              id: "data:" + item._id + ":value:units",
              type: "enum",
              name: formUtils.localizeString(item.text) + " (units)",
              jsonql: {
                type: "op",
                op: "#>>",
                exprs: [
                  {
                    type: "field",
                    tableAlias: "{alias}",
                    column: "data"
                  }, "{" + item._id + ",value,units}"
                ]
              },
              values: _.map(item.units, function(c) {
                return {
                  id: c.id,
                  name: formUtils.localizeString(c.label)
                };
              })
            };
            return addColumn(column);
          }
          break;
        case "location":
          column = {
            id: "data:" + item._id + ":value",
            type: "geometry",
            name: formUtils.localizeString(item.text),
            jsonql: {
              type: "op",
              op: "ST_SetSRID",
              exprs: [
                {
                  type: "op",
                  op: "ST_MakePoint",
                  exprs: [
                    {
                      type: "op",
                      op: "::decimal",
                      exprs: [
                        {
                          type: "op",
                          op: "#>>",
                          exprs: [
                            {
                              type: "field",
                              tableAlias: "{alias}",
                              column: "data"
                            }, "{" + item._id + ",value,latitude}"
                          ]
                        }
                      ]
                    }, {
                      type: "op",
                      op: "::decimal",
                      exprs: [
                        {
                          type: "op",
                          op: "#>>",
                          exprs: [
                            {
                              type: "field",
                              tableAlias: "{alias}",
                              column: "data"
                            }, "{" + item._id + ",value,longitude}"
                          ]
                        }
                      ]
                    }
                  ]
                }, 4326
              ]
            }
          };
          return addColumn(column);
        case "site":
          column = {
            id: "data:" + item._id + ":value",
            type: "join",
            name: formUtils.localizeString(item.text),
            join: {
              fromTable: "responses",
              fromColumn: {
                type: "op",
                op: "#>>",
                exprs: [
                  {
                    type: "field",
                    tableAlias: "{alias}",
                    column: "data"
                  }, "{" + item._id + ",value,code}"
                ]
              },
              toTable: item.siteTypes ? "entities." + _.first(item.siteTypes).toLowerCase().replace(" ", "_") : "entities.water_point",
              toColumn: "code",
              op: "=",
              multiple: true
            }
          };
          return addColumn(column);
        case "entity":
          column = {
            id: "data:" + item._id + ":value",
            type: "join",
            name: formUtils.localizeString(item.text),
            join: {
              fromTable: "responses",
              fromColumn: {
                type: "op",
                op: "#>>",
                exprs: [
                  {
                    type: "field",
                    tableAlias: "{alias}",
                    column: "data"
                  }, "{" + item._id + ",value}"
                ]
              },
              toTable: "entities." + item.entityType,
              toColumn: "_id",
              op: "=",
              multiple: true
            }
          };
          return addColumn(column);
      }
    }
  };

  return SchemaBuilder;

})();
