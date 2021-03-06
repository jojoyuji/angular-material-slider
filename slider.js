(function() {
  var MODULE_NAME, SLIDER_TAG, angularize, contain, events, gap, hSize, halfWidth, hide, module, offset, offsetLeft, pixelize, qualifiedDirectiveDefinition, roundStep, show, sliderDirective, width;

  MODULE_NAME = 'ui.slider';

  SLIDER_TAG = 'slider';

  angularize = function(element) {
    return angular.element(element);
  };

  pixelize = function(position) {
    return position + "px";
  };

  hide = function(element) {
    return element.css({
      opacity: 0
    });
  };

  show = function(element) {
    return element.css({
      opacity: 1
    });
  };

  offset = function(element, position) {
    return element.css({
      left: position
    });
  };

  hSize = function(element, position) {
    return element.css({
      width: position
    });
  };

  halfWidth = function(element) {
    return element[0].offsetWidth / 2;
  };

  offsetLeft = function(element) {
    return element[0].offsetLeft;
  };

  width = function(element) {
    return element[0].offsetWidth;
  };

  gap = function(element1, element2) {
    return offsetLeft(element2) - offsetLeft(element1) - width(element1);
  };

  contain = function(value) {
    if (isNaN(value)) {
      return value;
    }
    return Math.min(Math.max(0, value), 100);
  };

  roundStep = function(value, precision, step, floor) {
    var decimals, remainder, roundedValue, steppedValue;
    if (floor == null) {
      floor = 0;
    }
    if (step == null) {
      step = 1 / Math.pow(10, precision);
    }
    remainder = (value - floor) % step;
    steppedValue = remainder > (step / 2) ? value + step - remainder : value - remainder;
    decimals = Math.pow(10, precision);
    roundedValue = steppedValue * decimals / decimals;
    return parseFloat(roundedValue.toFixed(precision));
  };

  events = {
    mouse: {
      start: 'mousedown',
      move: 'mousemove',
      end: 'mouseup'
    },
    touch: {
      start: 'touchstart',
      move: 'touchmove',
      end: 'touchend'
    }
  };

  sliderDirective = function($timeout) {
    return {
      restrict: 'E',
      scope: {
        floor: '@',
        ceiling: '@',
        values: '=?',
        step: '@',
        highlight: '@',
        precision: '@',
        buffer: '@',
        dragstop: '@',
        ngModel: '=?',
        ngModelLow: '=?',
        ngModelHigh: '=?',
        ngChange: '&'
      },
      template: '<div class="bar-container">\n  <div class="bar">\n    <div class="bar-content"></div>\n    <div class="bar-content active"></div>\n    <div class="selection"></div>\n  </div>\n</div>\n<div class="handle low"><div class="inner"></div></div><div class="handle high"></div>\n<div class="bubble limit low">{{ values.length ? values[floor || 0] : floor }}</div>\n<div class="bubble limit high">{{ values.length ? values[ceiling || values.length - 1] : ceiling }}</div>\n<div class="bubble value low">{{ values.length ? values[local.ngModelLow || local.ngModel || 0] : local.ngModelLow || local.ngModel || 0 }}</div>\n<div class="bubble value high">{{ values.length ? values[local.ngModelHigh] : local.ngModelHigh }}</div>',
      compile: function(element, attributes) {
        var high, low, range, watchables;
        range = (attributes.ngModel == null) && (attributes.ngModelLow != null) && (attributes.ngModelHigh != null);
        low = range ? 'ngModelLow' : 'ngModel';
        high = 'ngModelHigh';
        watchables = ['floor', 'ceiling', 'values', low];
        if (range) {
          watchables.push(high);
        }
        return {
          post: function(scope, element, attributes) {
            var activeBar, bar, barContainer, barWidth, bound, ceilBub, dimensions, e, flrBub, handleHalfWidth, highBub, i, j, len, len1, lowBub, maxOffset, maxPtr, maxValue, minOffset, minPtr, minValue, ngDocument, offsetRange, ref1, ref2, selection, updateDOM, upper, valueRange, w;
            ref1 = (function() {
              var i, len, ref1, results;
              ref1 = element.children();
              results = [];
              for (i = 0, len = ref1.length; i < len; i++) {
                e = ref1[i];
                results.push(angularize(e));
              }
              return results;
            })(), barContainer = ref1[0], minPtr = ref1[1], maxPtr = ref1[2], flrBub = ref1[3], ceilBub = ref1[4], lowBub = ref1[5], highBub = ref1[6];
            bar = angularize(barContainer.children()[0]);
            selection = angularize(bar.children()[2]);
            activeBar = angularize(bar.children()[1]);
            if (!range) {
              ref2 = [maxPtr, highBub];
              for (i = 0, len = ref2.length; i < len; i++) {
                upper = ref2[i];
                upper.remove();
              }
              if (!attributes.highlight) {
                selection.remove();
              }
            }
            scope.local = {};
            scope.local[low] = scope[low];
            scope.local[high] = scope[high];
            bound = false;
            ngDocument = angularize(document);
            handleHalfWidth = barWidth = minOffset = maxOffset = minValue = maxValue = valueRange = offsetRange = void 0;
            dimensions = function() {
              var j, len1, ref3, value;
              if (scope.step == null) {
                scope.step = 1;
              }
              if (scope.floor == null) {
                scope.floor = 0;
              }
              if (scope.precision == null) {
                scope.precision = 0;
              }
              if (!range) {
                scope.ngModelLow = scope.ngModel;
              }
              if ((ref3 = scope.values) != null ? ref3.length : void 0) {
                if (scope.ceiling == null) {
                  scope.ceiling = scope.values.length - 1;
                }
              }
              scope.local[low] = scope[low];
              scope.local[high] = scope[high];
              for (j = 0, len1 = watchables.length; j < len1; j++) {
                value = watchables[j];
                if (typeof value === 'number') {
                  scope[value] = roundStep(parseFloat(scope[value]), parseInt(scope.precision), parseFloat(scope.step), parseFloat(scope.floor));
                }
              }
              handleHalfWidth = halfWidth(minPtr);
              barWidth = width(bar);
              minOffset = 0;
              maxOffset = barWidth - width(minPtr);
              minValue = parseFloat(scope.floor);
              maxValue = parseFloat(scope.ceiling);
              valueRange = maxValue - minValue;
              return offsetRange = maxOffset - minOffset;
            };
            updateDOM = function() {
              var bind, percentOffset, percentValue, pixelsToOffset, setBindings, setPointers;
              dimensions();
              percentOffset = function(offset) {
                return contain(((offset - minOffset) / offsetRange) * 100);
              };
              percentValue = function(value) {
                return contain(((value - minValue) / valueRange) * 100);
              };
              pixelsToOffset = function(percent) {
                return pixelize(percent * offsetRange / 100);
              };
              setPointers = function() {
                var a, b, newHighValue, newLowValue;
                offset(ceilBub, pixelize(barWidth - width(ceilBub)));
                a = scope.local[low];
                b = percentValue(1000);
                newLowValue = percentValue(scope.local[low]);
                offset(minPtr, pixelsToOffset(newLowValue));
                hSize(activeBar, pixelsToOffset(newLowValue));
                offset(lowBub, pixelize(offsetLeft(minPtr) - (halfWidth(lowBub)) + handleHalfWidth));
                offset(selection, pixelize(offsetLeft(minPtr) + handleHalfWidth));
                switch (true) {
                  case range:
                    newHighValue = percentValue(scope.local[high]);
                    offset(maxPtr, pixelsToOffset(newHighValue));
                    offset(highBub, pixelize(offsetLeft(maxPtr) - (halfWidth(highBub)) + handleHalfWidth));
                    return selection.css({
                      width: pixelsToOffset(newHighValue - newLowValue)
                    });
                  case attributes.highlight === 'right':
                    return selection.css({
                      width: pixelsToOffset(110 - newLowValue)
                    });
                  case attributes.highlight === 'left':
                    selection.css({
                      width: pixelsToOffset(newLowValue)
                    });
                    return offset(selection, 0);
                }
              };
              bind = function(handle, bubble, ref, events) {
                var currentRef, onEnd, onMove, onStart;
                currentRef = ref;
                onEnd = function() {
                  bubble.removeClass('active');
                  handle.removeClass('active');
                  ngDocument.unbind(events.move);
                  ngDocument.unbind(events.end);
                  if (scope.dragstop) {
                    scope[high] = scope.local[high];
                    scope[low] = scope.local[low];
                  }
                  if (typeof scope.ngChange === 'function') {
                    scope.ngChange();
                  }
                  currentRef = ref;
                  return scope.$apply();
                };
                onMove = function(event) {
                  var eventX, newOffset, newPercent, newValue, ref3, ref4, ref5;
                  eventX = event.clientX || ((ref3 = event.touches) != null ? ref3[0].clientX : void 0) || ((ref4 = event.originalEvent) != null ? (ref5 = ref4.changedTouches) != null ? ref5[0].clientX : void 0 : void 0) || 0;
                  newOffset = eventX - element[0].getBoundingClientRect().left - handleHalfWidth;
                  newOffset = Math.max(Math.min(newOffset, maxOffset), minOffset);
                  newPercent = percentOffset(newOffset);
                  newValue = minValue + (valueRange * newPercent / 100.0);
                  if (range) {
                    switch (currentRef) {
                      case low:
                        if (newValue > scope.local[high]) {
                          currentRef = high;
                          minPtr.removeClass('active');
                          lowBub.removeClass('active');
                          maxPtr.addClass('active');
                          highBub.addClass('active');
                          setPointers();
                        } else if (scope.buffer > 0) {
                          newValue = Math.min(newValue, scope.local[high] - scope.buffer);
                        }
                        break;
                      case high:
                        if (newValue < scope.local[low]) {
                          currentRef = low;
                          maxPtr.removeClass('active');
                          highBub.removeClass('active');
                          minPtr.addClass('active');
                          lowBub.addClass('active');
                          setPointers();
                        } else if (scope.buffer > 0) {
                          newValue = Math.max(newValue, parseInt(scope.local[low]) + parseInt(scope.buffer));
                        }
                    }
                  }
                  newValue = roundStep(newValue, parseInt(scope.precision), parseFloat(scope.step), parseFloat(scope.floor));
                  scope.local[currentRef] = newValue;
                  if (!scope.dragstop) {
                    scope[currentRef] = newValue;
                  }
                  setPointers();
                  return scope.$apply();
                };
                onStart = function(event) {
                  dimensions();
                  bubble.addClass('active');
                  handle.addClass('active');
                  setPointers();
                  event.stopPropagation();
                  event.preventDefault();
                  ngDocument.bind(events.move, onMove);
                  return ngDocument.bind(events.end, onEnd);
                };
                return handle.bind(events.start, onStart);
              };
              setBindings = function() {
                var j, len1, method, ref3;
                ref3 = ['touch', 'mouse'];
                for (j = 0, len1 = ref3.length; j < len1; j++) {
                  method = ref3[j];
                  bind(minPtr, lowBub, low, events[method]);
                  bind(maxPtr, highBub, high, events[method]);
                }
                var self = this;
                barContainer.bind('mousedown', function(event) {
                  var eventX, newOffset, newPercent, newValue, ref4, ref5, ref6;
                  eventX = event.clientX || ((ref4 = event.touches) != null ? ref4[0].clientX : void 0) || ((ref5 = event.originalEvent) != null ? (ref6 = ref5.changedTouches) != null ? ref6[0].clientX : void 0 : void 0) || 0;
                  newOffset = eventX - element[0].getBoundingClientRect().left - handleHalfWidth;
                  newOffset = Math.max(Math.min(newOffset, maxOffset), minOffset);
                  newPercent = percentOffset(newOffset);
                  newValue = minValue + (valueRange * newPercent / 100.0);
                  newValue = roundStep(newValue, parseInt(scope.precision), parseFloat(scope.step), parseFloat(scope.floor));
                  scope[low] = newValue;
                  minPtr.addClass('transiting active');
                  activeBar.addClass('transiting');
                  scope.$apply();
                  dimensions();

                  //ngDocument.unbind(events.move);
                  //ngDocument.unbind(events.end);
                  if (scope.dragstop) {
                    scope[high] = scope.local[high];
                    scope[low] = scope.local[low];
                  }
                  if (typeof scope.ngChange === 'function') {
                    scope.ngChange();
                  }
                  setPointers();
                });
                barContainer.bind('transitionend', function(event) {
                  minPtr.removeClass('transiting active');
                  return activeBar.removeClass('transiting');
                });
                return bound = true;
              };
              if (!bound) {
                setBindings();
              }
              return setPointers();
            };
            $timeout(updateDOM);
            for (j = 0, len1 = watchables.length; j < len1; j++) {
              w = watchables[j];
              scope.$watch(w, updateDOM, true);
            }
            return window.addEventListener('resize', updateDOM);
          }
        };
      }
    };
  };

  qualifiedDirectiveDefinition = ['$timeout', sliderDirective];

  module = function(window, angular) {
    return angular.module(MODULE_NAME, []).directive(SLIDER_TAG, qualifiedDirectiveDefinition);
  };

  module(window, window.angular);
}).call(this);
