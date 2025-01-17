"use strict";

var _interopRequireDefault = require("@babel/runtime/helpers/interopRequireDefault");
var _typeof = require("@babel/runtime/helpers/typeof");
Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = virtualize;
var _extends2 = _interopRequireDefault(require("@babel/runtime/helpers/extends"));
var _objectWithoutProperties2 = _interopRequireDefault(require("@babel/runtime/helpers/objectWithoutProperties"));
var _classCallCheck2 = _interopRequireDefault(require("@babel/runtime/helpers/classCallCheck"));
var _createClass2 = _interopRequireDefault(require("@babel/runtime/helpers/createClass"));
var _possibleConstructorReturn2 = _interopRequireDefault(require("@babel/runtime/helpers/possibleConstructorReturn"));
var _getPrototypeOf2 = _interopRequireDefault(require("@babel/runtime/helpers/getPrototypeOf"));
var _inherits2 = _interopRequireDefault(require("@babel/runtime/helpers/inherits"));
var _react = _interopRequireWildcard(require("react"));
var _propTypes = _interopRequireDefault(require("prop-types"));
var _reactSwipeableViewsCore = require("react-swipeable-views-core-babel-version-fix");
function _getRequireWildcardCache(e) { if ("function" != typeof WeakMap) return null; var r = new WeakMap(), t = new WeakMap(); return (_getRequireWildcardCache = function _getRequireWildcardCache(e) { return e ? t : r; })(e); }
function _interopRequireWildcard(e, r) { if (!r && e && e.__esModule) return e; if (null === e || "object" != _typeof(e) && "function" != typeof e) return { default: e }; var t = _getRequireWildcardCache(r); if (t && t.has(e)) return t.get(e); var n = { __proto__: null }, a = Object.defineProperty && Object.getOwnPropertyDescriptor; for (var u in e) { if ("default" !== u && Object.prototype.hasOwnProperty.call(e, u)) { var i = a ? Object.getOwnPropertyDescriptor(e, u) : null; i && (i.get || i.set) ? Object.defineProperty(n, u, i) : n[u] = e[u]; } } return n.default = e, t && t.set(e, n), n; }
function virtualize(MyComponent) {
  var Virtualize = /*#__PURE__*/function (_PureComponent) {
    (0, _inherits2.default)(Virtualize, _PureComponent);
    function Virtualize(props) {
      var _this;
      (0, _classCallCheck2.default)(this, Virtualize);
      _this = (0, _possibleConstructorReturn2.default)(this, (0, _getPrototypeOf2.default)(Virtualize).call(this, props));
      _this.timer = null;
      _this.state = {};
      _this.handleChangeIndex = function (indexContainer, indexLatest, meta) {
        var _this$props = _this.props,
          slideCount = _this$props.slideCount,
          onChangeIndex = _this$props.onChangeIndex;
        var indexDiff = indexContainer - indexLatest;
        var index = _this.state.index + indexDiff;
        if (slideCount) {
          index = (0, _reactSwipeableViewsCore.mod)(index, slideCount);
        }

        // Is uncontrolled
        if (_this.props.index === undefined) {
          _this.setIndex(index, indexContainer, indexDiff);
        }
        if (onChangeIndex) {
          onChangeIndex(index, _this.state.index, meta);
        }
      };
      _this.handleSwitching = function (indexContainer, type) {
        var _this$props2 = _this.props,
          slideCount = _this$props2.slideCount,
          onSwitching = _this$props2.onSwitching;
        var indexStart = _this.state.indexStart;
        var index = indexContainer + indexStart;
        if (slideCount) {
          index = (0, _reactSwipeableViewsCore.mod)(index, slideCount);
        }
        if (onSwitching) {
          onSwitching(index, type);
        }
      };
      _this.handleTransitionEnd = function () {
        // Delay the update of the window to fix an issue with react-motion.
        _this.timer = setTimeout(function () {
          _this.setWindow();
        }, 0);
        if (_this.props.onTransitionEnd) {
          _this.props.onTransitionEnd();
        }
      };
      _this.state.index = props.index || 0;
      return _this;
    }

    /**
     *
     *           index          indexStop
     *             |              |
     * indexStart  |       indexContainer
     *   |         |         |    |
     * ------------|-------------------------->
     *  -2    -1   0    1    2    3    4    5
     */
    (0, _createClass2.default)(Virtualize, [{
      key: "UNSAFE_componentWillMount",
      // eslint-disable-next-line camelcase,react/sort-comp
      value: function UNSAFE_componentWillMount() {
        this.setWindow(this.state.index);
      } // eslint-disable-next-line camelcase,react/sort-comp
    }, {
      key: "UNSAFE_componentWillReceiveProps",
      value: function UNSAFE_componentWillReceiveProps(nextProps) {
        var index = nextProps.index;
        if (typeof index === 'number' && index !== this.props.index) {
          var indexDiff = index - this.props.index;
          this.setIndex(index, this.state.indexContainer + indexDiff, indexDiff);
        }
      }
    }, {
      key: "componentWillUnmount",
      value: function componentWillUnmount() {
        clearInterval(this.timer);
      }
    }, {
      key: "setIndex",
      value: function setIndex(index, indexContainer, indexDiff) {
        var nextState = {
          index: index,
          indexContainer: indexContainer,
          indexStart: this.state.indexStart,
          indexStop: this.state.indexStop
        };

        // We are going forward, let's render one more slide ahead.
        if (indexDiff > 0 && (!this.props.slideCount || nextState.indexStop < this.props.slideCount - 1)) {
          nextState.indexStop += 1;
        }

        // Extend the bounds if needed.
        if (index > nextState.indexStop) {
          nextState.indexStop = index;
        }
        var beforeAhead = nextState.indexStart - index;

        // Extend the bounds if needed.
        if (beforeAhead > 0) {
          nextState.indexContainer += beforeAhead;
          nextState.indexStart -= beforeAhead;
        }
        this.setState(nextState);
      }
    }, {
      key: "setWindow",
      value: function setWindow() {
        var index = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : this.state.index;
        var slideCount = this.props.slideCount;
        var beforeAhead = this.props.overscanSlideBefore;
        var afterAhead = this.props.overscanSlideAfter;
        if (slideCount) {
          if (beforeAhead > index) {
            beforeAhead = index;
          }
          if (afterAhead + index > slideCount - 1) {
            afterAhead = slideCount - index - 1;
          }
        }
        this.setState({
          indexContainer: beforeAhead,
          indexStart: index - beforeAhead,
          indexStop: index + afterAhead
        });
      }
    }, {
      key: "render",
      value: function render() {
        var _this$props3 = this.props,
          children = _this$props3.children,
          indexProp = _this$props3.index,
          onChangeIndex = _this$props3.onChangeIndex,
          onSwitching = _this$props3.onSwitching,
          onTransitionEnd = _this$props3.onTransitionEnd,
          overscanSlideAfter = _this$props3.overscanSlideAfter,
          overscanSlideBefore = _this$props3.overscanSlideBefore,
          slideCount = _this$props3.slideCount,
          slideRenderer = _this$props3.slideRenderer,
          other = (0, _objectWithoutProperties2.default)(_this$props3, ["children", "index", "onChangeIndex", "onSwitching", "onTransitionEnd", "overscanSlideAfter", "overscanSlideBefore", "slideCount", "slideRenderer"]);
        var _this$state = this.state,
          indexContainer = _this$state.indexContainer,
          indexStart = _this$state.indexStart,
          indexStop = _this$state.indexStop;
        var slides = [];
        for (var slideIndex = indexStart; slideIndex <= indexStop; slideIndex += 1) {
          slides.push(slideRenderer({
            index: slideIndex,
            key: slideIndex
          }));
        }
        return _react.default.createElement(MyComponent, (0, _extends2.default)({
          index: indexContainer,
          onChangeIndex: this.handleChangeIndex,
          onSwitching: this.handleSwitching,
          onTransitionEnd: this.handleTransitionEnd
        }, other), slides);
      }
    }]);
    return Virtualize;
  }(_react.PureComponent);
  Virtualize.propTypes = process.env.NODE_ENV !== "production" ? {
    /**
     * @ignore
     */
    children: function children(props, propName) {
      if (props[propName] !== undefined) {
        return new Error("The children property isn't supported.");
      }
      return null;
    },
    /**
     * @ignore
     */
    index: _propTypes.default.number,
    /**
     * @ignore
     */
    onChangeIndex: _propTypes.default.func,
    /**
     * @ignore
     */
    onTransitionEnd: _propTypes.default.func,
    /**
     * Number of slide to render after the visible slide.
     */
    overscanSlideAfter: _propTypes.default.number,
    /**
     * Number of slide to render before the visible slide.
     */
    overscanSlideBefore: _propTypes.default.number,
    /**
     * When set, it's adding a limit to the number of slide: [0, slideCount].
     */
    slideCount: _propTypes.default.number,
    /**
     * Responsible for rendering a slide given an index.
     * ({ index: number }): node.
     */
    slideRenderer: _propTypes.default.func.isRequired
  } : {};
  Virtualize.defaultProps = {
    overscanSlideAfter: 2,
    // Render one more slide for going backward as it's more difficult to
    // keep the window up to date.
    overscanSlideBefore: 3
  };
  return Virtualize;
}