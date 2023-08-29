const user_input = $(".user-input")
const IP_div = $('#replaceable-content')
const modify_button = $('#modify-button')
const add_button = $('#add-button')
const endpoint = '/getDevice'
const delay_by_in_ms = 200
let scheduled_function = false
let last_IP_search

function pushNotify(status, title, text) {
    new Notify({
      status: status,
      title: title,
      text: text,
      effect: 'fade',
      speed: 500,
      showIcon: true,
      showCloseButton: true,
      autoclose: true,
      autotimeout: 2000,
      gap: 20,
      distance: 20,
      type: 1,
      position: 'right top'
    })
  }


function isEqual(obj1, obj2) {
    var props1 = Object.getOwnPropertyNames(obj1);
    var props2 = Object.getOwnPropertyNames(obj2);
    if (props1.length != props2.length) {
        return false; 
    }
    for (var i = 0; i < props1.length; i++) {
        let val1 = obj1[props1[i]];
        let val2 = obj2[props1[i]];
        let isObjects = isObject(val1) && isObject(val2);
        if (isObjects && !isEqual(val1, val2) || !isObjects && val1 !== val2) {
            return false;
        }
    }
    return true;
}
function isObject(object) {
    return object != null && typeof object === 'object';
}

var changed = function(instance, cell, x, y, value) {
    clearInterval(scheduled_function)
    PK = results_sheet.getCellFromCoords(0, y).innerHTML
    IP = results_sheet.getCellFromCoords(1, y).innerHTML
    MAC = results_sheet.getCellFromCoords(2, y).innerHTML
    COMMENT = results_sheet.getCellFromCoords(3,y).innerHTML
    TYPE = results_sheet.getCellFromCoords(4,y).innerHTML
    
    $.post('/modify', {pk: PK, ip: IP, mac:MAC, comment: COMMENT, type: TYPE})
        .done(function(kk){
            console.log(kk)
            scheduled_function = setInterval(() => {
                ajax_call(endpoint, last_IP_search)
                }, 2000);
        })
}

var select = function (instance, col, row)
    {
    if(col == 6)
    {
    if(results_sheet.options.editable === true)
    {
        clearInterval(scheduled_function)
            PK = results_sheet.getCellFromCoords(0, row).innerHTML
            IP = results_sheet.getCellFromCoords(1, row).innerHTML
            $.post("delete/", {pk: PK, ip: IP})
            .done(function(res) {
                console.log(res)
                if(res == 'ok') pushNotify('success', 'supprimé', 'l\'ip ' + IP + ' a ete supprimer')
                else
                {
                    pushNotify('error', 'l\'ip' + IP + 'ne peut pas etre supprimer', res)
                }
            })
        scheduled_function = setInterval(() => {
                        ajax_call(endpoint, last_IP_search)
                        }, 2000);
        }
        else
        pushNotify('error', 'activer le modification', 'pour supprimer les elements')
    }
    }
results_sheet = jspreadsheet(document.getElementById('spreadsheet'), {
    columns: [
        {type: 'number', title: 'pk', width: 50, editable: false},
        { type: 'text', title:'IP', width:200 },
        { type: 'text', title:'MAC', width:200 },
        { type: 'text', title:'COMMENTAIRE', width:300 },
        { type: 'text', title:'type', width:200 },
        { type: 'calendar', title:'date ajouter', width:200 },
        { title: 'delete', width: 100, type: 'text'}
    ],
    editable: false,
    allowInsertColumn: false,
    allowDeleteRow: false,
    allowDeleteColumn: false,
    allowInsertRow: false,
    onchange: changed,
    onselection: select,
});

let ajax_call = function (endpoint, request_parameters) {
    $.getJSON(endpoint, request_parameters)
        .done(response => {
                server_res = response
                sheet_data = results_sheet.getData()
                data = response
                data.forEach((e,i,arr)=>{
                    arr[i]=Object.values(Object.assign({}, e, {button: '❌'}))
                }
                ,data)

                if(isEqual(sheet_data, data) === false)
                    results_sheet.setData(data)

                })
}


user_input.on('keyup', function () {
    
    const request_parameters = {
        ip: $('#IP-search').val(), // value of user_input: the HTML element with ID user-input
        mac: $('#MAC-search').val(),
        comment: $('#comment-search').val(),
        type: $('#type-search').val()
    }
    
    last_IP_search = request_parameters

    ajax_call(endpoint, request_parameters)
})

$(document).ready(function()
{
    const request_parameters = {
    }
    ajax_call(endpoint, request_parameters)
})

scheduled_function = setInterval(() => {
ajax_call(endpoint, last_IP_search)
}, 2000);


modify_button.on('click', function () {
    if(results_sheet.options.editable === true)
        results_sheet.options.editable = false
    else
        results_sheet.options.editable = true

        this.innerHTML = (results_sheet.options.editable === false) ? 'activer modification' : 'deactiver modification'
        c = (results_sheet.options.editable === false) ? 'lightgreen' : 'lightcoral'
        this.style.backgroundColor = c
        $(".jexcel_container").css('background', c)
    })

add_button.on('click', function () {
    IP = $('#IP-add').val()
    MAC = $('#MAC-add').val()
    COMMENT = $('#comment-add').val()
    TYPE = $('#type-add').val()
    if (IP === '' || MAC === '' || COMMENT === '' || TYPE === '') {
        pushNotify('error', 'ajout echoué', 'champs manquants');
      } else {
    $.post('add/', {ip: IP, mac:MAC, comment: COMMENT, type: TYPE})
        .done(function(kk){
            console.log(kk == 'ok')
            if(kk == 'ok'){
                pushNotify('success', 'ajout reussi', 'l\'ip' + IP + ' a ete ajouter')
            }
            else
            {
                pushNotify('error', 'ajout echouer', kk)
            }
        })
    }
})