/*
 *		TERMINAL SIM - main.js
 *		Created by @helloBrent
 *		A JARVYS.io Project
 */

 var jarvys = angular.module('jarvys',['luegg.directives']);

jarvys.filter('nl2br', ['$sce', function ($sce) {
  return function (text) {
    return text ? $sce.trustAsHtml(text.replace(/\n/g, '<br/>')) : '';
  };
}]);

/*
 *      TERMINAL SIM - directive.js
 *      Created by @helloBrent
 *      A JARVYS.io Project
 */

jarvys.directive('ngEnter', function() {
  return function(scope, element, attrs) {
    element.bind("keydown keypress", function(event) {
      if(event.which === 13) {
        scope.$apply(function(){
          scope.$eval(attrs.ngEnter, {'event': event});
        });
        event.preventDefault();
      }
    });
  };
});

jarvys.directive('focusOn', function() {
   return function(scope, elem, attr) {
      scope.$on('focusOn', function(e, name) {
        if(name === attr.focusOn) {
          elem[0].focus();
        }
      });
   };
});

jarvys.factory('focus', function ($rootScope, $timeout) {
  return function(name) {
    $timeout(function (){
      $rootScope.$broadcast('focusOn', name);
    });
  }
});

(function(angular, undefined){
    'use strict';

    angular.module('luegg.directives', [])
    .directive('scrollGlue', function($parse){
        function unboundState(initValue){
            var activated = initValue;
            return {
                getValue: function(){
                    return activated;
                },
                setValue: function(value){
                    activated = value;
                }
            };
        }

        function oneWayBindingState(getter, scope){
            return {
                getValue: function(){
                    return getter(scope);
                },
                setValue: function(){}
            }
        }

        function twoWayBindingState(getter, setter, scope){
            return {
                getValue: function(){
                    return getter(scope);
                },
                setValue: function(value){
                    if(value !== getter(scope)){
                        scope.$apply(function(){
                            setter(scope, value);
                        });
                    }
                }
            };
        }

        function createActivationState(attr, scope){
            if(attr !== ""){
                var getter = $parse(attr);
                if(getter.assign !== undefined){
                    return twoWayBindingState(getter, getter.assign, scope);
                } else {
                    return oneWayBindingState(getter, scope);
                }
            } else {
                return unboundState(true);
            }
        }

        return {
            priority: 1,
            restrict: 'A',
            link: function(scope, $el, attrs){
                var el = $el[0],
                    activationState = createActivationState(attrs.scrollGlue, scope);

                function scrollToBottom(){
                    el.scrollTop = el.scrollHeight;
                }

                function onScopeChanges(scope){
                    if(activationState.getValue()){
                        scrollToBottom();
                    }
                }

                function shouldActivateAutoScroll(){
                    // + 1 catches off by one errors in chrome
                    return el.scrollTop + el.clientHeight + 1 >= el.scrollHeight;
                }

                function onScroll(){
                    activationState.setValue(shouldActivateAutoScroll());
                }

                scope.$watch(onScopeChanges);
                $el.bind('scroll', onScroll);
            }
        };
    });
}(angular));
/*
 *		TERMINAL SIM - controller.js
 *		Created by @helloBrent
 *		A JARVYS.io Project
 */

jarvys.controller('TerminalController', ['$scope','$timeout','focus', function($scope,$timeout,focus) {

	$scope.inputs = [{id:'input1'}];
	$scope.responses = [
		'error',
		'This host has been added successfully to your Jarvys account.\nThe initial backup will start automatically in less than an hour.\nIf you\'d like to backup right now, run the following command:\n\n<span class="terminal-command">jarvys backup</span>',
		'Backing up...',
		'Oops, try again. We\'re going to reset your CLI in 3 seconds.',
		'Item(s) to restore: /home/jdoe/project\nSnapshot from x days: 2\nRestore location: /root/jarvys-restore\n\nWARNING: Any files in the restore directory may be overwritten,\nmake sure any files you want to keep are safely moved elsewhere.\n\nContinue with restore? [y/n]',
		'Restoring...',
		'Backup complete!\n\nTry restoring with this command:\n\n<span class="terminal-command">jarvys restore /home/jdoe/project</span>',
		'Your file(s)/directory were successfully restored!',
		'Restore cancelled.\n\nTry again. We\'re going to reset your CLI in 3 seconds.'
	];

	$scope.inputCount = $scope.inputs.length-1;

	$scope.addNewInput = function() {
		var newID = $scope.inputs.length+1,
			inputId = $scope.inputs.length;
		$scope.inputs.push({'id':'input'+newID});
		focus($scope.inputs[inputId].id);
	};

	$scope.inputResponse2 = function(id, res) {
		$timeout(function(){
			if (res == 2) {
				$scope.inputs[id].response2 = $scope.responses[6];
				$scope.addNewInput();
			} else if (res == 5) {
				$scope.inputs[id].response2 = $scope.responses[7];
				$scope.addNewInput();
			};
		}, 2000);
	};

	$scope.inputResponse = function(id, res) {
		
		$scope.inputs[id].response = $scope.responses[res];
		$scope.inputs[id].disabled = true;
		$scope.inputResponse2(id,res);
		if (res !== 2 && res !== 5 && res!== 6 && res !== 8) {
			$scope.addNewInput();
		};
	};

	$scope.restartConsole = function(id, res) {
		$scope.inputs[id].response = $scope.responses[res];
		$scope.inputs[id].disabled = true;
		$timeout(function(){
			$scope.inputs = [{id:'input1'}];
			$scope.inputCount = $scope.inputs.length-1;
		}, 3000); 
	};

	$scope.terminalSubmit = function() {
		$scope.inputCount = $scope.inputs.length-1;

		if ($scope.inputCount == 0) {
			// 1st Level
			if ($scope.inputs[$scope.inputCount].name == 'curl -d \'{"k":"myKey"}\' https://my.jarvys.io/setup > jarvys-setup.sh && sh jarvys-setup.sh') {
				$scope.inputResponse($scope.inputCount,1);
			} else {
				$scope.inputResponse($scope.inputCount,0);
			};

		} else if ($scope.inputCount == 1) {
			// 2nd Level
			if ($scope.inputs[$scope.inputCount-1].name !== 'curl -d \'{"k":"myKey"}\' https://my.jarvys.io/setup > jarvys-setup.sh && sh jarvys-setup.sh' && $scope.inputs[$scope.inputCount].name == 'curl -d \'{"k":"myKey"}\' https://my.jarvys.io/setup > jarvys-setup.sh && sh jarvys-setup.sh') {
				$scope.inputResponse($scope.inputCount,1);
			} else if ($scope.inputs[$scope.inputCount-1].name == 'curl -d \'{"k":"myKey"}\' https://my.jarvys.io/setup > jarvys-setup.sh && sh jarvys-setup.sh' && $scope.inputs[$scope.inputCount].name == 'jarvys backup') {
				$scope.inputResponse($scope.inputCount,2);
			} else {
				$scope.restartConsole($scope.inputCount,3);
			};

		} else if ($scope.inputCount == 2) {
			// 3rd Level
			if ($scope.inputs[$scope.inputCount-1].name == 'curl -d \'{"k":"myKey"}\' https://my.jarvys.io/setup > jarvys-setup.sh && sh jarvys-setup.sh' && $scope.inputs[$scope.inputCount].name == 'jarvys backup') {
				$scope.inputResponse($scope.inputCount,2);
			} else if ($scope.inputs[$scope.inputCount-1].name == 'jarvys backup' && $scope.inputs[$scope.inputCount].name == 'jarvys restore /home/jdoe/project') {
				$scope.inputResponse($scope.inputCount,4);
			} else {
				$scope.restartConsole($scope.inputCount,3);
			};

		} else if ($scope.inputCount == 3) {
			// 4th Level
			if ($scope.inputs[$scope.inputCount-1].name == 'jarvys restore /home/jdoe/project' && $scope.inputs[$scope.inputCount].name == 'y') {
				$scope.inputResponse($scope.inputCount,5);
			} else if ($scope.inputs[$scope.inputCount-1].name == 'jarvys restore /home/jdoe/project' && $scope.inputs[$scope.inputCount].name == 'n') {
				$scope.restartConsole($scope.inputCount,8);
			} else if ($scope.inputs[$scope.inputCount-1].name == 'jarvys backup' && $scope.inputs[$scope.inputCount].name == 'jarvys restore /home/jdoe/project') {
				$scope.inputResponse($scope.inputCount,4);
			} else {
				$scope.restartConsole($scope.inputCount,3);
			};

		} else if ($scope.inputCount == 4) {
			// 5th Level
			if ($scope.inputs[$scope.inputCount-1].name == 'jarvys restore /home/jdoe/project' && $scope.inputs[$scope.inputCount].name == 'y') {
				$scope.inputResponse($scope.inputCount,5);
			} else if ($scope.inputs[$scope.inputCount-1].name == 'jarvys restore /home/jdoe/project' && $scope.inputs[$scope.inputCount].name == 'n') {
				$scope.restartConsole($scope.inputCount,8);
			} else {
				$scope.restartConsole($scope.inputCount,3);
			};

		} else {
			// ANYTHING DEEPER
			$scope.restartConsole($scope.inputCount,3);
		};
	};

}]);
