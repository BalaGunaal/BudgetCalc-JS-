//////////////////////////////////////BUDGET_CONTROLLER///////////////////////////////////////
var budgetController = (function() {

  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
    this.percentage = -1;
  };

  Expense.prototype.calcPercentage = function(totalInc){
    if(totalInc > 0){
      this.percentage = Math.round((this.value/totalInc) * 100);
    }else{
      this.percentage = -1;
    }
  };
  Expense.prototype.getPercentage = function(){
    return this.percentage;
  }

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = function(type) {
    var sum = 0;

    data.allItems[type].forEach(function(cur, index, array) {
      sum = sum + cur.value;
      /*
      Example:
      [200,300,400,500]
      sum = 0+200;
      sum = 200+300;
      sum = 500+400: ......
      */
    });

    data.total[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    total: {
      exp: 0,
      inc: 0
    },
    budget: 0,
    percentage: -1
  };

  return {
    addItem: function(type, des, val) {

      var newItem, ID;

      //creating ID
      //ID = last id + 1
      if (data.allItems[type].length > 0) {
        ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
      } else {
        ID = 0;
      }

      //creating new item based on EXP and INC
      if (type === 'exp') {
        newItem = new Expense(ID, des, val);
      } else if (type === 'inc') {
        newItem = new Income(ID, des, val);
      }

      //pushing it into data structure
      data.allItems[type].push(newItem);

      return newItem;
    },

    deleteItem: function(type,id) {
      var ids, index;

      ids = data.allItems[type].map(function(current){
        return current.id;
      });

      index = ids.indexOf(id);

      if (index !== -1) {
        data.allItems[type].splice(index, 1);
      }
    },

    // deleteItem: function(type, id) {
    //   var dataArr = data.allItems[type];
    //
    //   dataArr.forEach(element => {
    //     if (element.id === id) {
    //       removefromTotal(type, element.value)
    //       data.allItems[type].splice[dataArr.indexOf(element), 1];
    //       return;
    //     }
    //   });
    // },

    calculateBudget: function() {
      // 1.Calculate Total income and expenses
      calculateTotal('inc');
      calculateTotal('exp');

      // 2.Calculate Total BUDGET: income - expenses
      data.budget = data.total.inc - data.total.exp;

      // 3.Calculate the percentage of income that spent
      if (data.total.inc > 0) {
        data.percentage = Math.round((data.total.exp / data.total.inc) * 100);
      } else {
        data.percentage = -1;
      }
    },

    calculatePercentages: function(){

      data.allItems.exp.forEach(function(cur) {
        cur.calcPercentage(data.total.inc);
      });

    },

    getPercentages: function(){
      var allPer = data.allItems.exp.map(function(cur){
        return cur.getPercentage();
      });

      return allPer;
    },

    getBudget: function() {
      return {
        budget: data.budget,
        totalInc: data.total.inc,
        totalExp: data.total.exp,
        percentage: data.percentage
      }
    },

    testing: function() {
      return console.log(data);
    }
  };


})();



//////////////////////////////////////UI_CONTROLLER///////////////////////////////////////
var uiController = (function() {

  var domStrings = {
    inputType: '.add__type',
    inputDescription: '.add__description',
    inputValue: '.add__value',
    inputBtn: '.add__btn',
    incContainer: '.income__list',
    expContainer: '.expenses__list',
    budgetLabel: '.budget__value',
    incLabel: '.budget__income--value',
    expLabel: '.budget__expenses--value',
    percentageLabel: '.budget__expenses--percentage',
    container: '.container',
    eachPercentageLabel: '.item__percentage',
    dateLabel: '.budget__title--month'
  };

  var numFormat = function(valuenumber,type){

    var valueNumSplit,int,dec,type,sign;

    valuenumber = Math.abs(valuenumber);
    valuenumber = valuenumber.toFixed(2);

    valueNumSplit = valuenumber.split('.');

    int = valueNumSplit[0];
    if(int.length > 3){
      int = int.substr(0,int.length - 3) + ',' + int.substr(int.length - 3,3);
    }
    dec = valueNumSplit[1];

    return (type === 'exp' ? sign = '- ₹' : sign = '+ ₹') + ' ' + int + '.' + dec;

  };

  var eachNodeListItem = function(list,callback){
    for(i=0; i<list.length; i++){
      callback(list[i],i);
    }
  };

  return {
    getValue: function() {
      return {
        type: document.querySelector(domStrings.inputType).value,
        description: document.querySelector(domStrings.inputDescription).value,
        value: parseFloat(document.querySelector(domStrings.inputValue).value)
        // value: document.querySelector(domStrings.inputValue).value
      };
    },

    addListItem: function(obj, type) {
      var html, element, newHtml;
      //create HTML string with placeholder text
      if (type === 'inc') {
        element = domStrings.incContainer;
        html = '<div class="item clearfix" id= "inc-%id%" ><div class="item__description"> %description% </div><div class="right clearfix"><div class="item__value"> %value% </div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      } else if (type === 'exp') {
        element = domStrings.expContainer;
        html = '<div class="item clearfix" id= "exp-%id%" ><div class="item__description"> %description% </div><div class="right clearfix"><div class="item__value"> %value% </div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
      }

      //Replace the placeholder text with some actual data
      newHtml = html.replace('%id%', obj.id);
      newHtml = newHtml.replace('%description%', obj.description);
      newHtml = newHtml.replace('%value%', numFormat(obj.value,type));

      //Insert the HTML into the DOM
      document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
    },

    clearFields: function() {
      var fields, fieldArr;

      fields = document.querySelectorAll(domStrings.inputDescription + ',' + domStrings.inputValue);

      fieldArr = Array.prototype.slice.call(fields);

      fieldArr.forEach(function(current, index, array) {
        current.value = "";

      });

      fieldArr[0].focus();

    },

    displayBudget: function(obj) {

      var type;
      obj.budget > 0 ? type = 'inc' : type = 'exp';

      document.querySelector(domStrings.budgetLabel).textContent =  numFormat(obj.budget,type);
      document.querySelector(domStrings.incLabel).textContent =  numFormat(obj.totalInc,'inc');
      document.querySelector(domStrings.expLabel).textContent =  numFormat(obj.totalExp,'exp');

      if (obj.percentage > 0) {
        document.querySelector(domStrings.percentageLabel).textContent = obj.percentage + '%';
      } else {
        document.querySelector(domStrings.percentageLabel).textContent = "---";
      }

    },

    displayPercentage: function(percentages){

      var fields = document.querySelectorAll(domStrings.eachPercentageLabel);


      eachNodeListItem(fields, function(current,index){
        if(percentages[index] > 0){
          current.textContent = percentages[index] + '%';
        }else{
          current.textContent = '---';
        }
      });
    },

    displayMonYr: function(){
      var now,months,month,year;
      now = new Date();

      months = ['January','February','March','April','May','June','July','August','September','October','November','December'];
      month = now.getMonth();
      year = now.getFullYear();

      document.querySelector(domStrings.dateLabel).textContent = months[month] + ',' + year;
    },

    deleteListItem: function(id){
      var el = document.getElementById(id);
      el.parentNode.removeChild(el);
    },

    uEX: function(){
      var field = document.querySelectorAll(domStrings.inputType + ',' +
                                            domStrings.inputDescription + ',' +
                                            domStrings.inputValue);

          eachNodeListItem(field, function(cur){
            cur.classList.toggle('red-focus');
          });

          document.querySelector(domStrings.inputBtn).classList.toggle('red');
    },

    getDomStrings: function() {
      return domStrings;
    }

  };

})();



//////////////////////////////////////GLOBAL_CONTROLLER///////////////////////////////////////
var appController = (function(bdgtCtrl, uiCtrl) {

  // var popUp = prompt("Please enter the Month!");

  var addEventListener = function() {
    var Dom = uiCtrl.getDomStrings();

    document.querySelector(Dom.inputBtn).addEventListener('click', callCtrlFunc);

    document.addEventListener('keypress', function(e) {
      if (e.keycode === 13 || e.which === 13) {

        callCtrlFunc();

      }
    });

    document.querySelector(Dom.container).addEventListener('click', ctrlDeleteItem);

    document.querySelector(Dom.inputType).addEventListener('change', uiCtrl.uEX);
  }

  ////////////function//////////////
  var callCtrlFunc = function() {
    // 1.Get the filled input data.
    var getInput = uiCtrl.getValue();

    if (getInput.description !== "" && !isNaN(getInput.value) && getInput.value > 0) {
      // 2.Add the item to budgetController
      var newItem = bdgtCtrl.addItem(getInput.type, getInput.description, getInput.value);

      // 3.Add the item to UI.
      uiCtrl.addListItem(newItem, getInput.type);

      // 4.clearing input fields.
      uiCtrl.clearFields();

      // 5.calculate and update budget.
      updateBudget();

      // 6.Update percentage
      updatePercentage();
    }

  };

  var ctrlDeleteItem = function(event) {
    var itemID, splitID, type, ID;

    itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
    if (itemID) {
      splitID = itemID.split('-');
      type = splitID[0];
      ID = parseInt(splitID[1]);
      // console.log(splitID);
      // console.log(type);
      // console.log(ID);

      // 1.Delete the item from the DATA structure.
      bdgtCtrl.deleteItem(type, ID);

      // 2.Delete the item from UI.
      uiCtrl.deleteListItem(itemID);

      // 3.Update and show the New Budget
      updateBudget();

      // 4.Update percentage
      updatePercentage();
    }
  };

  var updateBudget = function() {
    // 1.calculate the Budget.
    bdgtCtrl.calculateBudget();

    // 2.Return the budget
    var finalBud = bdgtCtrl.getBudget();

    // 3.Display in UI.
    uiCtrl.displayBudget(finalBud);
  };



  var updatePercentage = function(){

    // 1. Calculate percentages
    bdgtCtrl.calculatePercentages();

    // 2. Get percentages
    var allPercentages = bdgtCtrl.getPercentages();

    // 3. Update percentages in UI
    // console.log(allPercentages);
    uiCtrl.displayPercentage(allPercentages);
  };

  return {
    // popUp,
    init: function() {
      uiCtrl.displayMonYr();
      uiCtrl.displayBudget({
        budget: 0,
        totalInc: 0,
        totalExp: 0,
        percentage: -1
      });
      addEventListener();
    }
  };

})(budgetController, uiController);

appController.init();
