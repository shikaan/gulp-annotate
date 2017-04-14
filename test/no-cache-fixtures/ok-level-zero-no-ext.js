(function (angular) {
    function myDirective() {
        return {
            restrict: "E",
            scope: {},
            //@NoCache()
            templateUrl: './my-directive_template'
        }
    }

    angular.module('module').directive('myDirective', myDirective);
}(angular))