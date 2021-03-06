'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _set = function set(object, property, value, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent !== null) { set(parent, property, value, receiver); } } else if ("value" in desc && desc.writable) { desc.value = value; } else { var setter = desc.set; if (setter !== undefined) { setter.call(receiver, value); } } return value; };

var _get = function get(object, property, receiver) { if (object === null) object = Function.prototype; var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _request = require('./request');

var _request2 = _interopRequireDefault(_request);

var _client = require('../../client');

var _response = require('./response');

var _urlPattern = require('url-pattern');

var _urlPattern2 = _interopRequireDefault(_urlPattern);

var _url = require('url');

var _url2 = _interopRequireDefault(_url);

var _localStorage = require('local-storage');

var _localStorage2 = _interopRequireDefault(_localStorage);

var _errors = require('../../errors');

var _query = require('../../query');

var _query2 = _interopRequireDefault(_query);

var _aggregation = require('../../aggregation');

var _aggregation2 = _interopRequireDefault(_aggregation);

var _es6Promise = require('es6-promise');

var _es6Promise2 = _interopRequireDefault(_es6Promise);

var _utils = require('../../utils');

var _rack = require('./rack');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var usersNamespace = process && process.env && process.env.KINVEY_USERS_NAMESPACE || 'user' || 'user';
var activeUserCollectionName = process && process.env && process.env.KINVEY_USER_ACTIVE_COLLECTION_NAME || undefined || 'kinvey_active_user';
var activeUsers = {};

var LocalRequest = function (_Request) {
  _inherits(LocalRequest, _Request);

  function LocalRequest() {
    var options = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};

    _classCallCheck(this, LocalRequest);

    var _this = _possibleConstructorReturn(this, (LocalRequest.__proto__ || Object.getPrototypeOf(LocalRequest)).call(this, options));

    _this.aggregation = options.aggregation;
    _this.query = options.query;
    _this.rack = new _rack.CacheRack();
    return _this;
  }

  _createClass(LocalRequest, [{
    key: 'execute',
    value: function execute() {
      var _this2 = this;

      return _get(LocalRequest.prototype.__proto__ || Object.getPrototypeOf(LocalRequest.prototype), 'execute', this).call(this).then(function (response) {
        if (!(response instanceof _response.KinveyResponse)) {
          response = new _response.KinveyResponse({
            statusCode: response.statusCode,
            headers: response.headers,
            data: response.data
          });
        }

        if (!response.isSuccess()) {
          throw response.error;
        }

        if ((0, _utils.isDefined)(_this2.query) && (0, _utils.isDefined)(response.data)) {
          response.data = _this2.query.process(response.data);
        }

        if ((0, _utils.isDefined)(_this2.aggregation) && (0, _utils.isDefined)(response.data)) {
          response.data = _this2.aggregation.process(response.data);
        }

        return response;
      });
    }
  }, {
    key: 'toPlainObject',
    value: function toPlainObject() {
      var obj = _get(LocalRequest.prototype.__proto__ || Object.getPrototypeOf(LocalRequest.prototype), 'toPlainObject', this).call(this);
      obj.appKey = this.appKey;
      obj.collection = this.collection;
      obj.entityId = this.entityId;
      obj.encryptionKey = this.client ? this.client.encryptionKey : undefined;
      return obj;
    }
  }, {
    key: 'query',
    get: function get() {
      return this._query;
    },
    set: function set(query) {
      if ((0, _utils.isDefined)(query) && !(query instanceof _query2.default)) {
        throw new _errors.KinveyError('Invalid query. It must be an instance of the Query class.');
      }

      this._query = query;
    }
  }, {
    key: 'aggregation',
    get: function get() {
      return this._aggregation;
    },
    set: function set(aggregation) {
      if ((0, _utils.isDefined)(aggregation) && !(aggregation instanceof _aggregation2.default)) {
        throw new _errors.KinveyError('Invalid aggregation. It must be an instance of the Aggregation class.');
      }

      this._aggregation = aggregation;
    }
  }, {
    key: 'url',
    get: function get() {
      return _get(LocalRequest.prototype.__proto__ || Object.getPrototypeOf(LocalRequest.prototype), 'url', this);
    },
    set: function set(urlString) {
      _set(LocalRequest.prototype.__proto__ || Object.getPrototypeOf(LocalRequest.prototype), 'url', urlString, this);
      var pathname = global.escape(_url2.default.parse(urlString).pathname);
      var pattern = new _urlPattern2.default('(/:namespace)(/)(:appKey)(/)(:collection)(/)(:entityId)(/)');

      var _ref = pattern.match(pathname) || {},
          appKey = _ref.appKey,
          collection = _ref.collection,
          entityId = _ref.entityId;

      this.appKey = appKey;
      this.collection = collection;
      this.entityId = entityId;
    }
  }], [{
    key: 'loadActiveUser',
    value: function loadActiveUser() {
      var client = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _client.Client.sharedInstance();

      var request = new LocalRequest({
        method: _request.RequestMethod.GET,
        url: _url2.default.format({
          protocol: client.protocol,
          host: client.host,
          pathname: '/' + usersNamespace + '/' + client.appKey + '/' + activeUserCollectionName
        })
      });
      return request.execute().then(function (response) {
        return response.data;
      }).then(function (users) {
        if (users.length > 0) {
          return users[0];
        }

        var legacyActiveUser = LocalRequest.loadActiveUserLegacy(client);
        if ((0, _utils.isDefined)(legacyActiveUser)) {
          return LocalRequest.setActiveUser(client, legacyActiveUser);
        }

        return null;
      }).then(function (activeUser) {
        activeUsers[client.appKey] = activeUser;
        return activeUser;
      }).catch(function () {
        return null;
      });
    }
  }, {
    key: 'loadActiveUserLegacy',
    value: function loadActiveUserLegacy() {
      var client = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _client.Client.sharedInstance();

      var activeUser = LocalRequest.getActiveUserLegacy(client);
      activeUsers[client.appKey] = activeUser;
      return activeUser;
    }
  }, {
    key: 'getActiveUser',
    value: function getActiveUser() {
      var client = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _client.Client.sharedInstance();

      return activeUsers[client.appKey];
    }
  }, {
    key: 'getActiveUserLegacy',
    value: function getActiveUserLegacy() {
      var client = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _client.Client.sharedInstance();

      try {
        return _localStorage2.default.get(client.appKey + 'kinvey_user');
      } catch (error) {
        return null;
      }
    }
  }, {
    key: 'setActiveUser',
    value: function setActiveUser() {
      var client = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _client.Client.sharedInstance();
      var user = arguments[1];

      var promise = _es6Promise2.default.resolve(null);
      var activeUser = LocalRequest.getActiveUser(client);

      if ((0, _utils.isDefined)(activeUser)) {
        LocalRequest.setActiveUserLegacy(client, null);

        activeUsers[client.appKey] = null;

        var request = new LocalRequest({
          method: _request.RequestMethod.DELETE,
          url: _url2.default.format({
            protocol: client.protocol,
            host: client.host,
            pathname: '/' + usersNamespace + '/' + client.appKey + '/' + activeUserCollectionName + '/' + activeUser._id
          })
        });
        promise = request.execute().then(function (response) {
          return response.data;
        });
      }

      return promise.then(function () {
        if ((0, _utils.isDefined)(user) === false) {
          return null;
        }

        activeUsers[client.appKey] = user;

        LocalRequest.setActiveUserLegacy(client, user);

        var request = new LocalRequest({
          method: _request.RequestMethod.POST,
          url: _url2.default.format({
            protocol: client.protocol,
            host: client.host,
            pathname: '/' + usersNamespace + '/' + client.appKey + '/' + activeUserCollectionName
          }),
          body: user
        });
        return request.execute().then(function (response) {
          return response.data;
        });
      }).then(function () {
        return user;
      });
    }
  }, {
    key: 'setActiveUserLegacy',
    value: function setActiveUserLegacy() {
      var client = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : _client.Client.sharedInstance();
      var user = arguments[1];

      try {
        _localStorage2.default.remove(client.appKey + 'kinvey_user');

        if ((0, _utils.isDefined)(user)) {
          _localStorage2.default.set(client.appKey + 'kinvey_user', user);
        }

        return true;
      } catch (error) {
        return false;
      }
    }
  }]);

  return LocalRequest;
}(_request2.default);

exports.default = LocalRequest;