import axios from 'axios';
import React, { useEffect } from 'react'
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { IoIosRefresh } from "react-icons/io";
import { FaPlusCircle, FaMinusCircle } from "react-icons/fa";
import { MdOutlineDeleteOutline } from "react-icons/md";
import { SelectButton } from 'primereact/selectbutton';
import { Checkbox } from 'primereact/checkbox';
import { InputSwitch } from 'primereact/inputswitch';
import { Calendar } from 'primereact/calendar';
import { Dropdown } from 'primereact/dropdown';



const Todo = () => {
  const [views, setViews] = React.useState([]);
  const [viewData, setViewData] = React.useState<any[]>([]);
  const [selectedView, setSelectedView] = React.useState<any>(null);

  const [sprocs, setSprocs] = React.useState([]);
  const [selectedSproc, setSelectedSproc] = React.useState<string | null>(null);

  const [size,setSize] = React.useState<string>("small")
  const sizeOptions = [
    { label: 'Small', value: 'small' },
    { label: 'Medium', value: 'normal' },
    { label: 'Large', value: 'large' },
  ];

  const [filterDone, setFilterDone] = React.useState(false);

  const [filters, setFilters] = React.useState<any>()

  const [category, setCategory] = React.useState<any>([])
  const [who, setWho] = React.useState<any>([])


  
  
  useEffect(() => {
    axios.get('http://localhost:3030/listViews')
      .then(response => {
        setViews(response.data);
      })
      .catch(error => {
        console.error(error);
      });
      
    axios.get('http://localhost:3030/listSprocs')
    .then(response => {
      setSprocs(response.data);
    })
    .catch(error => {
      console.error(error);
    });

    getCats()
    getWhos()
  }, []);

  function getCats() {
    axios.get('http://localhost:3030/getCategories')
      .then(response => {
        setCategory(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }

  function getWhos() {
    axios.get('http://localhost:3030/getWhos')
      .then(response => {
        setWho(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }

  function getViews() {
    axios.get('http://localhost:3030/listViews')
      .then(response => {
        setViews(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }

  function getSprocs() {
    axios.get('http://localhost:3030/listSprocs')
    .then(response => {
      setSprocs(response.data);
    })
    .catch(error => {
      console.error(error);
    });
  }

  function addEmptyRow(data) {
    var add = true

    for (const key in data) {
      if (data[key].ItemId === 0) {
        add = false
      }
    }

    if (data.length === 0) {
      add = false
    }
    

    if (!add) {
      return data;
    }

    // copy first row on response.data to newRow
    const newRow = { ...data[0] };

    // for each key in newrow set to null
    for (const key in newRow) {
      if (newRow.hasOwnProperty(key)) {
        if (key === "ItemId") {
          // set ItemId to 0
          newRow[key] = 0;
        } else if (key === "Date") {
          // set date to today
          const today = new Date();
          const formattedDate = today.toISOString().split('T')[0]; // YYYY-MM-DD format
          newRow[key] = formattedDate;
        } else if (key === "Name") {
          // set name to empty string
          newRow[key] = "Add a new item...";
        } else {
          newRow[key] = null;
        }
      }
    }
    data.push(newRow)
    return data;
  }

  function getView(viewName: string) {
    axios.get(`http://localhost:3030/getView/${viewName}`)
      .then(response => {
        const newData = addEmptyRow(response.data)
        setViewData(newData);
        //console.log("View Data: ", newData)
      })
      .catch(error => {
        console.error(error);
      });
  }

  function selectSproc(sprocName: string) {
    setSelectedSproc(sprocName);
    setSelectedView(null);
  }

  function executeSelectedSproc() {
    if (selectedSproc) {
      axios.post('http://localhost:3030/executeSproc', {
        sprocName: selectedSproc,
      })
        .then(response => {
          console.log("Sproc executed: ", response.data);
          getViews()
        })
        .catch(error => {
          console.error(error);
        });
    }

  }

  function selectView(view) {
    setSelectedView(view);
    setSelectedSproc(null);
    getView(view.Name);
  }




  function checkItem(rowData: any) {
    console.log("Checking item: ", rowData)
    var toCheck = rowData.Done ? 0 : 1;

    axios.post('http://localhost:3030/markItemAsDoneById', {
      itemId: rowData.ItemId,
      done: toCheck
    })
      .then(response => {
        getView(selectedView.Name);

      })
      .catch(error => {
        console.error(error);
      });
  }

  function editRow(rowData: any) {
    console.log("Editing row: ", rowData)

    if (!rowData.newData) {
      return;
    }

    // save rowData to database
    if (rowData.newData.ItemId && rowData.newData.ItemId !== 0) {
      axios.post('http://localhost:3030/updateRow', {
        data: rowData.data,
        newData: rowData.newData,
        view: selectedView
      })
      .then(response => {
        console.log("Row updated: ", response.data);
        selectView(selectedView);
      })
      .catch(error => {
        console.error(error);
      });
    } else {
      axios.post('http://localhost:3030/createRow', {
        data: rowData.newData,
        view: selectedView
      })
      .then(response => {
        console.log("Row Created: ", response.data);
        selectView(selectedView);
      })
      .catch(error => {
        console.error(error);
      });
    }
  }

  function incrementDate(itemId: number) {
    axios.post('http://localhost:3030/incrementItemDate', {
      itemId: itemId,
    })
      .then(response => {
        console.log("Date incremented: ", response.data);
        getView(selectedView.Name);
      })
      .catch(error => {
        console.error(error);
      });
  }
  function decrementDate(itemId: number) {
    axios.post('http://localhost:3030/decrementItemDate', {
      itemId: itemId,
    })
      .then(response => {
        console.log("Date decremented: ", response.data);
        getView(selectedView.Name);
      })
      .catch(error => {
        console.error(error);
      });
  }

  function deleteRow(rowData: any) {
    console.log("Deleting row: ", rowData)
    axios.post('http://localhost:3030/deleteRow', {
      data: rowData,
      view: selectedView
    })
    .then(response => {
      console.log("Row deleted: ", response.data);
      getView(selectedView.Name);
    })
    .catch(error => {
      console.error(error);
    });
  }

  function formatDate(rowData: any) {
    var strdate = rowData.ItemDate;
    if (!strdate) {
      return <div style={{ padding: "1rem" }}></div>;
    }
    strdate = strdate.slice(0,-1)
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const date = new Date(strdate);
    const formattedDate = date.toLocaleDateString('en-US', options);
    return <div style={{ padding: "0.5rem", alignItems: "center", display: "flex", gap: "1rem"}}>
        <FaMinusCircle className='clickable' onClick={() => decrementDate(rowData.ItemId)} /> 
        {formattedDate}
        <FaPlusCircle className='clickable' onClick={() => incrementDate(rowData.ItemId)}/>
      </div>;
  }

  function getFilteredData() {
    var data = viewData;
    if (filterDone) {
      data = data.filter((item) => item.Done == null || item.Done == 0);
    } 
    return data
  }

  function guessDataType(field: string) {

    var data = viewData.map(a => a[field]);
    data = data.map(item => item === "" ? null : item);
    data = data.filter((item) => item !== null && item !== undefined);

    if (field === "Done") {
      return "boolean"
    }
    if (field.endsWith("Id")) {
      return "dropdown"
    }
    // if field contains "Date" then return date
    if (field.includes("Date")) {
      return "date"
    }

    if (data.length === 0) {
      return "string"
    }

    // check if all values are numbers
    var allNumbers = data.every((item) => !isNaN(item) );
    if (allNumbers) {
      return "number"
    }
    
    return "string"
  }

  const formatCheckBox = (rowData: any) => {
    if (rowData.ItemId && rowData.ItemId !== 0) {
      return <div style={{paddingLeft: "0.5rem"}}>
        <Checkbox checked={rowData.Done} onChange={(e) => checkItem(rowData)} />
      </div>;
    }
  }

  const deleteButton = (rowData: any) => {
    return <div style={{ padding: "1rem", textAlign: 'center', fontSize: "1.25rem" }}>
            <MdOutlineDeleteOutline className='clickable' onClick={() => deleteRow(rowData)} />
          </div>
  }

  const textEditor = (options) => {
    var column = options.column.props.header
    var dataType = guessDataType(column);
    console.log("Column: ", column, dataType)

    if (dataType == "boolean") {
      return <div style={{paddingLeft: "0.5rem"}}>
          <Checkbox checked={options.rowData[column]} onChange={(e) => options.editorCallback(!options.rowData[column])} />
        </div>
    } else if (dataType == "date") {
      return <div>
        <Calendar value={options.value} onChange={(e) => options.editorCallback(e.value)} dateFormat="mm/dd/yy" showIcon showButtonBar showOn="focus" placeholder="Select a date" />
      </div>
    } else if (dataType == "dropdown") {
      var field = column.slice(0, -2);
      if (field === "Who") {
        return <Dropdown options={who} optionLabel="Name" value={options.rowData[column]} onChange={(e) => options.editorCallback(e.value)} placeholder="Who..." />;
      } else if (field === "Category") {
        return <Dropdown options={category} optionLabel="Name" value={options.CategoryId} onChange={(e) => options.editorCallback(e.value)} placeholder="Category..." />;
      }
      
    }
    else if (dataType == "number") {
      return <InputText className="cellEdit" type="number" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} disabled={options.field == selectedView.UpdateKey} />;
    }
    return <InputText className="cellEdit" type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} disabled={options.field == selectedView.UpdateKey} />;
  };

  const withPadding = (options, key) => {
    return <div style={{paddingLeft: "0.5rem"}}>{options[key]}</div>;
  }

  
  return (
    <div className='todo'>
        <div className='todo_nav'>
          <div className='row'>
            <div className='bold'>Views</div>
            <span></span>
            <div className='clickable'><IoIosRefresh onClick={getViews}/></div>
          </div>
          
          <br/>
          {views.sort((a,b) => a.SortOrder - b.SortOrder).map((view: any, index: number) => (
            <div className="todo_nav_choice" key={index}>
              <div className="row" onClick={() => selectView(view)}>
                <div>{view.DisplayName}</div>
                <span></span>
                <div>{view.Count}</div>
              </div>
            </div>
          ))}
          <br/>
          
          <div className='row'>
            <div className='bold'>SProcs</div>
            <span></span>
            <div className='clickable'><IoIosRefresh onClick={getSprocs}/></div>
          </div>
          <br/>
          {sprocs.map((sproc: any, index: number) => (
            <div className="todo_nav_choice" key={index}>
              <div className="row" onClick={() => selectSproc(sproc.name)}>{sproc.name}</div>
            </div>
          ))}
        </div>

        {selectedView && (

          <div className='todo_table'>
            <div className='row'>
              <div className='bold' >{selectedView.Name}</div>  
              <span></span>
              <div className='clickable'><IoIosRefresh onClick={() => getView(selectedView.Name)}/></div>
            </div>
            <br/>
            <div className='options_row'>
              <SelectButton value={size} onChange={(e) => setSize(e.value)} options={sizeOptions} />
              <h3>Hide Done: </h3>
              <InputSwitch checked={filterDone} onChange={(e) => setFilterDone(e.value)} />

            </div>
            <br/>
            <DataTable scrollHeight="flex" value={getFilteredData()} className="p-datatable-striped" editMode="row" onRowEditComplete={editRow} removableSort showGridlines scrollable resizableColumns tableStyle={{ minWidth: '85rem', width: '100%' }} size={size}>
              {Object.keys(viewData[0] || {}).map((key, index) => {
                  var header = key;

                  if (key === "ItemDate") {
                    return (
                      <Column key={index} body={formatDate} header={header} sortable editor={(options) => textEditor(options)}></Column>
                    )
                  } else if (key === "Done") {
                    return (
                      <Column key={index} body={formatCheckBox} header={header} sortable editor={(options) => textEditor(options)}></Column>
                    )
                  } else {
                    return (
                      <Column body={(options) => withPadding(options, key)} key={index} field={key} header={header} sortable editor={(options) => textEditor(options)}></Column>
                    )
                  }
              })}
              {selectedView.UpdateTarget && (
                <Column rowEditor={true} headerStyle={{ minWidth: '1rem' }} bodyStyle={{ padding: "0.5rem", textAlign: 'center' }} ></Column>
              )}
              {selectedView.UpdateTarget && (
                <Column headerStyle={{ minWidth: '1rem' }} bodyStyle={{ padding: "0rem", textAlign: 'center' }} body={deleteButton} ></Column>
              )}
            </DataTable>
          </div>
        )}

        {selectedSproc && (
          <div>
            <button onClick={() => executeSelectedSproc()}>Execute</button>
          </div>
        )}
    </div>
  )
}

export default Todo

