var Schema, SchemaBuilder, _, formUtils, fs, pluralize,
  indexOf = [].indexOf || function(item) { for (var i = 0, l = this.length; i < l; i++) { if (i in this && this[i] === item) return i; } return -1; };

_ = require('lodash');

Schema = require('../../Schema');

fs = require('fs');

formUtils = require('mwater-forms/lib/formUtils');

pluralize = function(str) {
  if (str.match(/ater$/)) {
    return str;
  }
  if (str.match(/s$/)) {
    return str + "es";
  }
  if (str.match(/y$/)) {
    return str.substr(0, str.length - 1) + "ies";
  }
  return str + "s";
};

module.exports = SchemaBuilder = (function() {
  function SchemaBuilder(schema) {
    this.schema = schema;
  }

  SchemaBuilder.prototype.addEntities = function(options) {
    var entityType, i, j, k, len, len1, len2, prop, ref, ref1, ref2, reverseJoins, rj, tableId;
    reverseJoins = [];
    ref = options.entityTypes;
    for (i = 0, len = ref.length; i < len; i++) {
      entityType = ref[i];
      tableId = "entities." + entityType.code;
      this.schema.addTable({
        id: tableId,
        name: pluralize(entityType.name.en),
        ordering: "_created_on",
        primaryKey: "_id"
      });
      ref1 = options.properties;
      for (j = 0, len1 = ref1.length; j < len1; j++) {
        prop = ref1[j];
        if (!_.any(prop._roles, function(r) {
          var ref2;
          if (r.to === "all") {
            return true;
          }
          if (options.user && r.to === ("user:" + options.user)) {
            return true;
          }
          if (options.groups && (ref2 = r.to, indexOf.call(_.map(options.groups || [], function(g) {
            return "group:" + g;
          }), ref2) >= 0)) {
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
                name: _.findWhere(options.units, {
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
            table: "entities." + prop.ref_entity_type,
            column: {
              id: "!" + tableId + "." + prop.code,
              name: pluralize(entityType.name.en),
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
        } else if ((ref2 = prop.type) !== 'json' && ref2 !== 'image' && ref2 !== 'imagelist') {
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
        name: "Added by user",
        type: "text"
      });
      this.schema.addColumn(tableId, {
        id: "_created_for",
        name: "Added by group",
        type: "text"
      });
      this.schema.addColumn(tableId, {
        id: "_created_on",
        name: "Date added",
        type: "datetime"
      });
    }
    for (k = 0, len2 = reverseJoins.length; k < len2; k++) {
      rj = reverseJoins[k];
      this.schema.addColumn(rj.table, rj.column);
    }
    return this.schema.setTableStructure("entities.water_point", Schema.parseStructureFromText(fs.readFileSync(__dirname + '/structures/water_point.txt', 'utf-8')));
  };

  SchemaBuilder.prototype.addLegacyTables = function() {
    this.schema.addTable({
      id: "source_notes",
      name: "Functionality Reports (legacy. do not use!)",
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
    this.schema.addColumn("entities.water_point", {
      id: "source_notes",
      name: "Functional Reports (legacy. do not use!)",
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
    this.schema.addTable({
      id: "ecoli_statuses",
      name: "E.Coli Risk Level (experimental)",
      ordering: "date"
    });
    this.schema.addColumn("ecoli_statuses", {
      id: "date",
      name: "Test Date",
      type: "date"
    });
    this.schema.addColumn("ecoli_statuses", {
      id: "status",
      name: "E.Coli Risk Level",
      type: "enum",
      values: [
        {
          id: 'red',
          name: 'High (>=100 CFU/100mL)'
        }, {
          id: 'yellow',
          name: 'Medium (>=1 CFU/100mL)'
        }, {
          id: 'green',
          name: 'Low (<1 CFU/100mL)'
        }
      ]
    });
    this.schema.addColumn("ecoli_statuses", {
      id: "water_point",
      name: "Water Point",
      type: "join",
      join: {
        fromTable: "ecoli_statuses",
        fromColumn: "water_point",
        toTable: "entities.water_point",
        toColumn: "_id",
        op: "=",
        multiple: false
      }
    });
    return this.schema.addColumn("entities.water_point", {
      id: "ecoli_statuses",
      name: "E.Coli Risk Levels (experimental)",
      type: "join",
      join: {
        fromTable: "entities.water_point",
        fromColumn: "_id",
        toTable: "ecoli_statuses",
        toColumn: "water_point",
        op: "=",
        multiple: true
      }
    });
  };

  SchemaBuilder.prototype.addForm = function(form) {
    var deploymentValues, structure;
    this.schema.addTable({
      id: "responses:" + form._id,
      name: "Form: " + formUtils.localizeString(form.design.name),
      primaryKey: "_id"
    });
    structure = [];
    deploymentValues = _.map(form.deployments, function(dep) {
      return {
        id: dep._id,
        name: dep.name
      };
    });
    this.schema.addColumn("responses:" + form._id, {
      id: "deployment",
      type: "enum",
      name: "Deployment",
      values: deploymentValues
    });
    structure.push({
      type: "column",
      column: "deployment"
    });
    this.schema.addColumn("responses:" + form._id, {
      id: "user",
      type: "text",
      name: "Enumerator"
    });
    structure.push({
      type: "column",
      column: "user"
    });
    this.schema.addColumn("responses:" + form._id, {
      id: "submittedOn",
      type: "datetime",
      name: "Submitted On"
    });
    structure.push({
      type: "column",
      column: "submittedOn"
    });
    this.addFormItem(form, form.design, structure);
    return this.schema.setTableStructure("responses:" + form._id, structure);
  };

  SchemaBuilder.prototype.addFormItem = function(form, item, structure) {
    var addColumn, answerType, choice, column, i, j, k, len, len1, len2, name, ref, ref1, ref2, results, results1, sectionStructure, subitem;
    addColumn = (function(_this) {
      return function(column) {
        _this.schema.addColumn("responses:" + form._id, column);
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
          } else if (item.units.length === 1) {
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
                            }, "{" + item._id + ",value,longitude}"
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
                            }, "{" + item._id + ",value,latitude}"
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
              multiple: false
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
                op: "::uuid",
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
              },
              toTable: "entities." + item.entityType,
              toColumn: {
                type: "field",
                tableAlias: "{alias}",
                column: "_id"
              },
              op: "=",
              multiple: false
            }
          };
          return addColumn(column);
      }
    }
  };

  return SchemaBuilder;

})();
