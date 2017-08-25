"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var core_1 = require('@angular/core');
var UtilService = (function () {
    function UtilService() {
    }
    UtilService.prototype.getOrgLogo = function (organisation) {
        if (organisation === "SCDF HQ" || organisation === "scdf HQ") {
            return "img/unitlogo/scdf logo.jpg";
        }
        else if (organisation === "SPF HQ" || organisation === "spf HQ") {
            return "img/unitlogo/spf logo.jpg";
        }
        else if (organisation === "MOT HQ" || organisation === "mot HQ") {
            return "img/unitlogo/mot logo.jpg";
        }
        else if (organisation === "MOT" || organisation === "mot") {
            return "img/unitlogo/mot logo.jpg";
        }
        else if (organisation === "MHA HQ" || organisation === "mha HQ") {
            return "img/unitlogo/mha logo.jpg";
        }
        else if (organisation === "MHA HCCC" || organisation === "mha hccc") {
            return "img/unitlogo/mha logo.jpg";
        }
        else if (organisation === "MOH HQ" || organisation === "moh HQ") {
            return "img/unitlogo/MOH logo.jpg";
        }
        else {
            return "img/unitlogo/no logo.jpg";
        }
    };
    UtilService.prototype.isJsonEmpty = function (obj) {
        for (var prop in obj) {
            if (obj.hasOwnProperty(prop)) {
                return false;
            }
        }
        return true;
    };
    UtilService = __decorate([
        core_1.Injectable(), 
        __metadata('design:paramtypes', [])
    ], UtilService);
    return UtilService;
}());
exports.UtilService = UtilService;
//# sourceMappingURL=util.service.js.map