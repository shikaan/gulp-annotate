(function (angular) {
    function myDirective() {
        return {
            restrict: "E",
            scope: {},
            //@NoCache()
            templateUrl: 'my-directive_template.html'
        }
    }

    angular.module('module').directive('myDirective', myDirective);
}(angular))