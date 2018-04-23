'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.getComputedValues = exports.isLoading = exports.getSyncedList = exports.getLocalList = exports.getInitialStateTemplate = exports.CrudListReducerGenerator = undefined;

var _extends = Object.assign || function (target) { for (var i = 1; i < arguments.length; i++) { var source = arguments[i]; for (var key in source) { if (Object.prototype.hasOwnProperty.call(source, key)) { target[key] = source[key]; } } } return target; };

var _reduxWrapperExtended = require('redux-wrapper-extended');

require('regenerator-runtime');

function _asyncToGenerator(fn) { return function () { var gen = fn.apply(this, arguments); return new Promise(function (resolve, reject) { function step(key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { return Promise.resolve(value).then(function (value) { step("next", value); }, function (err) { step("throw", err); }); } } return step("next"); }); }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

function finalizeWrapper(wrapper, prefix, plural, identifyingFunc) {
  wrapper.addHandler(prefix + '.startLoading', function (s) {
    return _extends({}, s, {
      isLoading: true
    });
  }).addHandler(prefix + '.stopLoading', function (s) {
    return _extends({}, s, {
      isLoading: false
    });
  }).addHandler(prefix + '.clear', function (s) {
    return _extends({}, s, {
      localItemDict: {},
      syncedItemDict: {},
      toBeAddedList: []
    });
  }).addHandler(prefix + '.set' + plural, function (s, items) {
    var localItemDict = _extends({}, s.localItemDict);
    items.forEach(function (item) {
      var key = identifyingFunc(item);
      localItemDict[key] = item;
    });
    return _extends({}, s, {
      localItemDict: localItemDict
    });
  }).addHandler(prefix + '.setSynced' + plural, function (s, items) {
    var localItemDict = _extends({}, s.localItemDict);
    var syncedItemDict = _extends({}, s.syncedItemDict);
    items.forEach(function (item) {
      var key = identifyingFunc(item);
      localItemDict[key] = item;
      syncedItemDict[key] = item;
    });
    return _extends({}, s, {
      localItemDict: localItemDict,
      syncedItemDict: syncedItemDict
    });
  }).addHandler(prefix + '.setSyncedByKeys', function (s, newItemDict) {
    var localItemDict = _extends({}, s.localItemDict, newItemDict);
    var syncedItemDict = _extends({}, s.syncedItemDict, newItemDict);
    Object.keys(newItemDict).forEach(function (key) {
      if (newItemDict[key] == null) {
        delete localItemDict[key];
        delete syncedItemDict[key];
      }
    });
    return _extends({}, s, {
      localItemDict: localItemDict,
      syncedItemDict: syncedItemDict
    });
  }).addHandler(prefix + '.startAdding' + plural, function (s, items) {
    var toBeAddedList = [].concat(_toConsumableArray(s.toBeAddedList), _toConsumableArray(items));
    return _extends({}, s, {
      toBeAddedList: toBeAddedList
    });
  }).addHandler(prefix + '.completeAdding' + plural, function (s, items) {
    var toBeAddedList = [].concat(_toConsumableArray(s.toBeAddedList));
    items.forEach(function (item) {
      var index = toBeAddedList.indexOf(item);
      if (index >= 0 && index < toBeAddedList.length) {
        toBeAddedList.splice(index, 1);
      }
    });

    return _extends({}, s, {
      toBeAddedList: toBeAddedList
    });
  }).addHandler(prefix + '.modify' + plural, function (s, items) {
    var localItemDict = _extends({}, s.localItemDict);
    items.forEach(function (item) {
      var key = identifyingFunc(item);
      localItemDict[key] = item;
    });
    return _extends({}, s, {
      localItemDict: localItemDict
    });
  }).addHandler(prefix + '.completeUpdating' + plural, function (s, items) {
    var localItemDict = _extends({}, s.localItemDict);
    var syncedItemDict = _extends({}, s.syncedItemDict);
    items.forEach(function (item) {
      var key = identifyingFunc(item);
      localItemDict[key] = item;
      syncedItemDict[key] = item;
    });
    return _extends({}, s, {
      syncedItemDict: syncedItemDict
    });
  }).addHandler(prefix + '.startRemoving' + plural, function (s, items) {
    var localItemDict = _extends({}, s.localItemDict);
    items.forEach(function (item) {
      var key = identifyingFunc(item);
      delete localItemDict[key];
    });
    return _extends({}, s, {
      localItemDict: localItemDict
    });
  }).addHandler(prefix + '.finishRemoving' + plural, function (s, items) {
    var localItemDict = _extends({}, s.localItemDict);
    var syncedItemDict = _extends({}, s.syncedItemDict);
    items.forEach(function (item) {
      var key = identifyingFunc(item);
      delete localItemDict[key];
      delete syncedItemDict[key];
    });
    return _extends({}, s, {
      localItemDict: localItemDict,
      syncedItemDict: syncedItemDict
    });
  });
}

var getInitialStateTemplate = function getInitialStateTemplate() {
  return {
    localItemDict: {},
    syncedItemDict: {},
    toBeAddedList: [],
    isLoading: false
  };
};

var Reduce = function Reduce(config) {
  var prefix = config.prefix,
      singular = config.singular,
      plural = config.plural;


  var reducerWrapper = new _reduxWrapperExtended.ReducerWrapper(getInitialStateTemplate());
  var actionDict = {};

  var obj = {
    identifiedBy: function identifiedBy(identifyingFunc) {
      finalizeWrapper(reducerWrapper, prefix, plural, identifyingFunc);
      return obj;
    },
    generate: function generate() {
      obj.onPopulatingItemsLocally();
      obj.onSettingItemLocally();
      obj.onSettingItemsLocally();
      obj.onModifyingItemLocally();
      obj.onModifyingItemsLocally();
      obj.onRemovingItemLocally();
      obj.onRemovingItemsLocally();
      return {
        reducer: reducerWrapper.getReducer(),
        generateActions: function generateActions(dispatch) {
          var returnedActions = {};
          Object.keys(actionDict).forEach(function (actionName) {
            returnedActions[actionName] = actionDict[actionName](dispatch);
          });
          return returnedActions;
        }
      };
    },
    onSettingItemLocally: function onSettingItemLocally() {
      actionDict['set' + singular + 'Locally'] = function (dispatch) {
        return function (item) {
          (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.set' + plural, [item]);
        };
      };
      return obj;
    },
    onSettingItemsLocally: function onSettingItemsLocally() {
      actionDict['set' + plural + 'Locally'] = function (dispatch) {
        return function (items) {
          (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.set' + plural, items);
        };
      };
      return obj;
    },
    onPopulatingItemsLocally: function onPopulatingItemsLocally() {
      actionDict['populate' + plural + 'Locally'] = function (dispatch) {
        return function (items) {
          (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.clear');
          (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.set' + plural, items);
        };
      };
      return obj;
    },
    onPopulatingSyncedItems: function onPopulatingSyncedItems(asyncFunc) {
      var _this = this;

      actionDict['populate' + plural] = function (dispatch) {
        return function () {
          var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(params) {
            var items;
            return regeneratorRuntime.wrap(function _callee$(_context) {
              while (1) {
                switch (_context.prev = _context.next) {
                  case 0:
                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.startLoading');
                    _context.prev = 1;
                    _context.next = 4;
                    return asyncFunc(params);

                  case 4:
                    items = _context.sent;

                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.clear');
                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.setSynced' + plural, items);
                    _context.next = 11;
                    break;

                  case 9:
                    _context.prev = 9;
                    _context.t0 = _context['catch'](1);

                  case 11:
                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.stopLoading');

                  case 12:
                  case 'end':
                    return _context.stop();
                }
              }
            }, _callee, _this, [[1, 9]]);
          }));

          return function (_x) {
            return _ref.apply(this, arguments);
          };
        }();
      };
      return obj;
    },
    onExecutingCrudSyncedItems: function onExecutingCrudSyncedItems(methodName, asyncFunc) {
      var _this2 = this;

      actionDict[methodName] = function (dispatch) {
        return function () {
          var _ref2 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee2(params) {
            var localItemDict;
            return regeneratorRuntime.wrap(function _callee2$(_context2) {
              while (1) {
                switch (_context2.prev = _context2.next) {
                  case 0:
                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.startLoading');
                    _context2.prev = 1;
                    _context2.next = 4;
                    return asyncFunc(params);

                  case 4:
                    localItemDict = _context2.sent;

                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.setSyncedByKeys', localItemDict);
                    _context2.next = 11;
                    break;

                  case 8:
                    _context2.prev = 8;
                    _context2.t0 = _context2['catch'](1);
                    throw _context2.t0;

                  case 11:
                    _context2.prev = 11;

                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.stopLoading');
                    return _context2.finish(11);

                  case 14:
                  case 'end':
                    return _context2.stop();
                }
              }
            }, _callee2, _this2, [[1, 8, 11, 14]]);
          }));

          return function (_x2) {
            return _ref2.apply(this, arguments);
          };
        }();
      };
      return obj;
    },
    onAddingItem: function onAddingItem(asyncFunc) {
      var _this3 = this;

      actionDict['add' + singular] = function (dispatch) {
        return function () {
          var _ref3 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee3(toBeAddedItem) {
            var addedItem;
            return regeneratorRuntime.wrap(function _callee3$(_context3) {
              while (1) {
                switch (_context3.prev = _context3.next) {
                  case 0:
                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.startLoading');
                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.startAdding' + plural, [toBeAddedItem]);
                    _context3.prev = 2;
                    _context3.next = 5;
                    return asyncFunc(toBeAddedItem);

                  case 5:
                    addedItem = _context3.sent;

                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.completeAdding' + plural, [toBeAddedItem]);
                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.setSynced' + plural, [addedItem]);
                    _context3.next = 13;
                    break;

                  case 10:
                    _context3.prev = 10;
                    _context3.t0 = _context3['catch'](2);
                    throw _context3.t0;

                  case 13:
                    _context3.prev = 13;

                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.stopLoading');
                    return _context3.finish(13);

                  case 16:
                  case 'end':
                    return _context3.stop();
                }
              }
            }, _callee3, _this3, [[2, 10, 13, 16]]);
          }));

          return function (_x3) {
            return _ref3.apply(this, arguments);
          };
        }();
      };
      return obj;
    },
    onAddingItems: function onAddingItems(asyncFunc) {
      var _this4 = this;

      actionDict['add' + plural] = function (dispatch) {
        return function () {
          var _ref4 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee4(toBeAddedItems) {
            var addedItems;
            return regeneratorRuntime.wrap(function _callee4$(_context4) {
              while (1) {
                switch (_context4.prev = _context4.next) {
                  case 0:
                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.startLoading');
                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.startAdding' + plural, toBeAddedItems);
                    _context4.prev = 2;
                    _context4.next = 5;
                    return asyncFunc(toBeAddedItems);

                  case 5:
                    addedItems = _context4.sent;

                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.completeAdding' + plural, toBeAddedItems);
                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.setSynced' + plural, addedItems);
                    _context4.next = 13;
                    break;

                  case 10:
                    _context4.prev = 10;
                    _context4.t0 = _context4['catch'](2);
                    throw _context4.t0;

                  case 13:
                    _context4.prev = 13;

                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.stopLoading');
                    return _context4.finish(13);

                  case 16:
                  case 'end':
                    return _context4.stop();
                }
              }
            }, _callee4, _this4, [[2, 10, 13, 16]]);
          }));

          return function (_x4) {
            return _ref4.apply(this, arguments);
          };
        }();
      };
      return obj;
    },
    onModifyingItemLocally: function onModifyingItemLocally() {
      actionDict['modify' + singular + 'Locally'] = function (dispatch) {
        return function (item) {
          (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.set' + plural, [item]);
        };
      };
      return obj;
    },
    onModifyingItemsLocally: function onModifyingItemsLocally() {
      actionDict['modify' + plural + 'Locally'] = function (dispatch) {
        return function (items) {
          (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.set' + plural, items);
        };
      };
      return obj;
    },
    onUpdatingItem: function onUpdatingItem(asyncFunc) {
      var _this5 = this;

      actionDict['update' + singular] = function (dispatch) {
        return function () {
          var _ref5 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee5(toBeUpdatedItem) {
            var updatedItem;
            return regeneratorRuntime.wrap(function _callee5$(_context5) {
              while (1) {
                switch (_context5.prev = _context5.next) {
                  case 0:
                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.startLoading');
                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.set' + plural, [toBeUpdatedItem]);
                    _context5.prev = 2;
                    _context5.next = 5;
                    return asyncFunc(toBeUpdatedItem);

                  case 5:
                    updatedItem = _context5.sent;

                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.setSynced' + plural, [updatedItem]);
                    _context5.next = 12;
                    break;

                  case 9:
                    _context5.prev = 9;
                    _context5.t0 = _context5['catch'](2);
                    throw _context5.t0;

                  case 12:
                    _context5.prev = 12;

                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.stopLoading');
                    return _context5.finish(12);

                  case 15:
                  case 'end':
                    return _context5.stop();
                }
              }
            }, _callee5, _this5, [[2, 9, 12, 15]]);
          }));

          return function (_x5) {
            return _ref5.apply(this, arguments);
          };
        }();
      };
      return obj;
    },
    onUpdatingItems: function onUpdatingItems(asyncFunc) {
      var _this6 = this;

      actionDict['update' + plural] = function (dispatch) {
        return function () {
          var _ref6 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee6(toBeUpdatedItems) {
            var updatedItems;
            return regeneratorRuntime.wrap(function _callee6$(_context6) {
              while (1) {
                switch (_context6.prev = _context6.next) {
                  case 0:
                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.startLoading');
                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.set' + plural, toBeUpdatedItems);
                    _context6.prev = 2;
                    _context6.next = 5;
                    return asyncFunc(toBeUpdatedItems);

                  case 5:
                    updatedItems = _context6.sent;

                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.setSynced' + plural, updatedItems);
                    _context6.next = 12;
                    break;

                  case 9:
                    _context6.prev = 9;
                    _context6.t0 = _context6['catch'](2);
                    throw _context6.t0;

                  case 12:
                    _context6.prev = 12;

                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.stopLoading');
                    return _context6.finish(12);

                  case 15:
                  case 'end':
                    return _context6.stop();
                }
              }
            }, _callee6, _this6, [[2, 9, 12, 15]]);
          }));

          return function (_x6) {
            return _ref6.apply(this, arguments);
          };
        }();
      };
      return obj;
    },
    onRemovingItemLocally: function onRemovingItemLocally() {
      actionDict['remove' + singular + 'Locally'] = function (dispatch) {
        return function (toBeRemovedItem) {
          (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.startRemoving' + plural, [toBeRemovedItem]);
        };
      };
      return obj;
    },
    onRemovingItemsLocally: function onRemovingItemsLocally() {
      actionDict['remove' + plural + 'Locally'] = function (dispatch) {
        return function (toBeRemovedItems) {
          (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.startRemoving' + plural, toBeRemovedItems);
        };
      };
      return obj;
    },
    onRemovingItem: function onRemovingItem(asyncFunc) {
      var _this7 = this;

      actionDict['remove' + singular] = function (dispatch) {
        return function () {
          var _ref7 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee7(toBeRemovedItem) {
            var removedItem;
            return regeneratorRuntime.wrap(function _callee7$(_context7) {
              while (1) {
                switch (_context7.prev = _context7.next) {
                  case 0:
                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.startLoading');
                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.startRemoving' + plural, [toBeRemovedItem]);
                    _context7.prev = 2;
                    _context7.next = 5;
                    return asyncFunc(toBeRemovedItem);

                  case 5:
                    removedItem = _context7.sent;

                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.finishRemoving' + plural, [removedItem]);
                    _context7.next = 12;
                    break;

                  case 9:
                    _context7.prev = 9;
                    _context7.t0 = _context7['catch'](2);
                    throw _context7.t0;

                  case 12:
                    _context7.prev = 12;

                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.stopLoading');
                    return _context7.finish(12);

                  case 15:
                  case 'end':
                    return _context7.stop();
                }
              }
            }, _callee7, _this7, [[2, 9, 12, 15]]);
          }));

          return function (_x7) {
            return _ref7.apply(this, arguments);
          };
        }();
      };
      return obj;
    },
    onRemovingItems: function onRemovingItems(asyncFunc) {
      var _this8 = this;

      actionDict['remove' + plural] = function (dispatch) {
        return function () {
          var _ref8 = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee8(toBeRemovedItems) {
            var removedItems;
            return regeneratorRuntime.wrap(function _callee8$(_context8) {
              while (1) {
                switch (_context8.prev = _context8.next) {
                  case 0:
                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.startLoading');
                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.startRemoving' + plural, toBeRemovedItems);
                    _context8.prev = 2;
                    _context8.next = 5;
                    return asyncFunc(toBeRemovedItems);

                  case 5:
                    removedItems = _context8.sent;

                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.finishRemoving' + plural, removedItems);
                    _context8.next = 12;
                    break;

                  case 9:
                    _context8.prev = 9;
                    _context8.t0 = _context8['catch'](2);
                    throw _context8.t0;

                  case 12:
                    _context8.prev = 12;

                    (0, _reduxWrapperExtended.dispatchAction)(dispatch, prefix + '.stopLoading');
                    return _context8.finish(12);

                  case 15:
                  case 'end':
                    return _context8.stop();
                }
              }
            }, _callee8, _this8, [[2, 9, 12, 15]]);
          }));

          return function (_x8) {
            return _ref8.apply(this, arguments);
          };
        }();
      };
      return obj;
    }
  };
  return obj;
};

var CrudListReducerGenerator = {
  Reduce: Reduce
};
var getLocalList = function getLocalList(state) {
  var list = Object.keys(state.localItemDict).map(function (key) {
    return state.localItemDict[key];
  });
  list.concat(state.toBeAddedList);
  return list;
};
var getSyncedList = function getSyncedList(state) {
  return Object.keys(state.syncedItemDict).map(function (key) {
    return state.syncedItemDict[key];
  });
};
var isLoading = function isLoading(state) {
  return state.isLoading;
};
var getComputedValues = function getComputedValues(state) {
  return {
    localList: getLocalList(state),
    syncedList: getSyncedList(state),
    isLoading: isLoading(state)
  };
};

exports.CrudListReducerGenerator = CrudListReducerGenerator;
exports.getInitialStateTemplate = getInitialStateTemplate;
exports.getLocalList = getLocalList;
exports.getSyncedList = getSyncedList;
exports.isLoading = isLoading;
exports.getComputedValues = getComputedValues;