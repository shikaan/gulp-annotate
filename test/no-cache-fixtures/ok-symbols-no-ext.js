(function (angular) {
    function myDirective() {
        return {
            restrict: "E",
            scope: {},
            //@NoCache()
            templateUrl: 'asd/my_diretive.zip/my-directive_template'
        }
    }

    angular.module('module').directive('myDirective', myDirective);
}(angular))