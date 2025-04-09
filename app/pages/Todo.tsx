import axios from 'axios';
import React, { useEffect } from 'react'
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { ToggleButton } from 'primereact/togglebutton';

const Todo = () => {
  const [views, setViews] = React.useState([]);
  const [viewData, setViewData] = React.useState([]);
  const [checked, setChecked] = React.useState(false);

  const [selectedView, setSelectedView] = React.useState<string | null>(null);
  
  useEffect(() => {
    axios.get('http://localhost:3030/listViews')
      .then(response => {
        setViews(response.data);
      })
      .catch(error => {
        console.error(error);
      });
  }, []);

  function getView(viewName: string) {
    console.log("Getting view: ", viewName)
    axios.get(`http://localhost:3030/getView/${viewName}`)
      .then(response => {
        setViewData(response.data);
        console.log("View Data: ", response.data)
      })
      .catch(error => {
        console.error(error);
      });
  }

  function selectView(viewName: string) {
    console.log("Selected view: ", viewName)
    setSelectedView(viewName);
    getView(viewName);
  }

  function formatDate(rowData: any) {
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
    const date = new Date(rowData.Date);
    const formattedDate = date.toLocaleDateString('en-US', options);
    return formattedDate;
  }

  const formatCheckBox = (rowData: any) => {
    console.log("Checkbox: ", rowData.Done)
    return <ToggleButton checked={rowData.Done} onChange={(e) => checkItem(rowData.ItemId, e.value)} />;
  }

  function checkItem(itemId : number, checked: boolean) {
    console.log("Checking item: ", itemId, " checked: ", checked)
  }

  function editRow(rowData: any) {
    console.log("Editing row: ", rowData)
  }

  
  const textEditor = (options) => {
    return <InputText type="text" value={options.value} onChange={(e) => options.editorCallback(e.target.value)} />;
  };
  
  return (
    <div className='todo'>
        <div className='todo_nav'>
          <div className='bold'>Views</div>
          {views.map((view: any, index: number) => (
            <div className="todo_nav_choice" key={index}>
              <p onClick={() => selectView(view.name)}>{view.name}</p>
            </div>
          ))}
        </div>

        {selectedView && (
          <div className='todo_table'>
            <div className='bold' >{selectedView}</div>  
            <br/>
            <DataTable value={viewData} tableStyle={{ minWidth: '75rem' }} className="p-datatable-striped" dataKey="ItemId" editMode="row" onRowEditComplete={editRow} removableSort showGridlines>
              {Object.keys(viewData[0] || {}).map((key, index) => {
                if (key !== 'ItemId') {// Exclude the ItemId column
                  var header = key;

                  if (key === "Date") {
                    return (
                      <Column key={index} body={formatDate} header={header} sortable editor={(options) => textEditor(options)}></Column>
                    )
                  } else if (key === "Done") {
                    return (
                      <Column key={index} body={formatCheckBox} header={header} sortable editor={(options) => textEditor(options)}></Column>
                    )
                  } else {
                    return (
                      <Column className="p-2" key={index} field={key} header={header} sortable editor={(options) => textEditor(options)}></Column>
                    )
                  }
              }
              })}
              <Column rowEditor={true} headerStyle={{ width: '10%', minWidth: '8rem' }} bodyStyle={{ textAlign: 'center' }}></Column>
            </DataTable>
          </div>
        )}
    </div>
  )
}

export default Todo

