(function (angular) {
    function myDirective() {
        return {
            restrict: "E",
            scope: {},
            templateUrl: 'my-diretive/my-directive.template.html'
        }
    }

    angular.module('module').directive('myDirective', myDirective);
}(angular))