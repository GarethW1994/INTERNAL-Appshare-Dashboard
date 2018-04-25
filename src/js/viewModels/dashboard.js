define(['ojs/ojcore', 'knockout', 'jquery', 'serviceworker', 'ojs/ojknockout', 'ojs/ojlabel', 'ojs/ojformlayout', 'ojs/ojselectcombobox', 'ojs/ojmasonrylayout', 'jet-composites/modules-graph/loader', 'jet-composites/account-graph/loader', 'jet-composites/mobile-graph/loader', 'jet-composites/log-dates/loader', 'jet-composites/mobile-graph/loader', 'jet-composites/total-logs/loader'],
    function(oj, ko, $) {

        function DashboardViewModel() {
            var self = this;
            self.nowrap = ko.observable(false);

            /// REMOVED COMPONENT DATA BUT KEPT IN CASE NEEDED ///
            // self.value = ko.observable(oj.IntlConverterUtils.dateToLocalIso(new Date()));
            // self.max = ko.observable((new Date().toISOString()));

            // let retentionDays = { days: 20 };
            // self.agreement = ko.observableArray();
            // self.noOfDays = ko.computed(function() {
            //     let diff = Math.abs(new Date() - new Date(self.value()));

            //     let days = diff / (1000 * 60 * 60 * 24);

            //     return days.toFixed() + " days";
            // });
            ///////////////////////////////////////////////////

            self.isSmall = oj.ResponsiveKnockoutUtils.createMediaQueryObservable(
                oj.ResponsiveUtils.getFrameworkQuery(oj.ResponsiveUtils.FRAMEWORK_QUERY_KEY.SM_ONLY));

            // For small screens: labels on top
            // For medium screens and up: labels inline
            self.labelEdge = ko.computed(function() {
                return this.isSmall() ? "top" : "start";
            }, this);

            // Filter Functionality
            self.val = ko.observable();
            self.isDisabled = ko.observable(false);
            self.customers = ko.observableArray([]);
            self.logs = ko.observableArray();
            var rawData = [];

            self.selectedValue = (event) => {
                event.preventDefault();
                let option = event.detail.value;

                // check if param exist in url
                let url = new URL(window.location);

                if (url["search"]) {
                    getParams(url["search"]);
                } else {
                    customerFilter(option);
                };
            };

            // retreiving data from backend service
            serviceworker.getLogData("GET", "http://localhost:3001/readactivity").done((logs) => {
                self.logs(logs);
                rawData = logs;
                self.customers([]);
                self.customers.push({ "value": "All Customers", "label": "All Customers", disabled: false });
                let customerList = {};

                self.logs().forEach(log => {
                    if (customerList[log.appCustomer] === undefined) {
                        customerList[log.appCustomer] = 1;
                        self.customers.push({ "value": log.appCustomer, "label": log.appCustomer, disabled: false });
                    };
                });
            });

            const getParams = (url) => {
                let urlSplit = url.split("=");
                let customer = urlSplit[1].replace(/%20/g, " ");

                urlFilter(customer);
            };

            // URL Customer Filter
            const urlFilter = (customer) => {
                customerFilter(customer, true);
            };

            const customerFilter = (customerOption, queryDetected = false) => {
                let filteredData = [];

                if (customerOption) {
                    let customer = customerOption.toLowerCase();
                    if (customer === "all customers") {
                        self.logs(rawData);
                    } else {
                        rawData.filter(log => {
                            if (log.appCustomer.toLowerCase() === customer) {
                                filteredData.push(log);
                            };
                        });
                        self.logs(filteredData);
                    };
                };

                try {
                    if (queryDetected) {
                        self.val(filteredData[0]["appCustomer"]);
                        self.isDisabled(true);
                    };
                } catch (error) {
                    console.log("No Data Found");
                }

            };


            self.chemicals = [{
                    name: 'logs',
                    sizeClass: 'oj-masonrylayout-tile-3x1'
                }, {
                    name: 'mobile',
                    sizeClass: 'oj-masonrylayout-tile-3x1'
                },
                {
                    name: 'logDates',
                    sizeClass: 'oj-masonrylayout-tile-2x1'
                }, {
                    name: 'modules',
                    sizeClass: 'oj-masonrylayout-tile-4x4'
                },
                {
                    name: 'accounts',
                    sizeClass: 'oj-masonrylayout-tile-4x4'
                }
            ];

            self.handleBindingsApplied = function(info) {
                $('#modules').append($('#filterCustomers'));
                $('#modules').append($('#moduleGraph'));
                $('#accounts').append($('#accountGraph'));
                $('#mobile').append($('#mobileGraph'));
                $("#logs").append($("#totalLogs"));
                $("#logDates").append($("#logDateGraph"));
            };
        };
        return new DashboardViewModel();
    });