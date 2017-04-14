(function (angular) {
    function myDirective() {
        return {
            restrict: "E",
            scope: {},
            //@NoCache()
            templateUrl: 'my-diretive/folder/.././my-directive'
        }
    }

    angular.module('module').directive('myDirective', myDirective);
}(angular))