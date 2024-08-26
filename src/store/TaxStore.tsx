import { action, makeObservable, observable } from "mobx";
interface TaxData {
    tckn: number;
    taxType: string;
    price: number;
    taxAmount: number;
    lastPaymentDate: string;
    total: number;
}

class TaxStore {
  tckn: number=0;
  price:number=0;
  allTckn:number[]=[];
  taxAmount:number | null=0;
  total:number | null=0;
  taxType:string="";
  selectedRowData:TaxData| null =null
  rowData: TaxData[]=[{
    tckn:0,
    taxType:"",
    price:0,
    taxAmount:0,
    lastPaymentDate:"",
    total:0
  }];
  errorMessages:{rowIndex:number,message:string}[]=[];
  

  constructor() {
    makeObservable(this, {
      tckn: observable,
      rowData:observable,
      price:observable,
      allTckn:observable,
      taxAmount:observable,
      total:observable,
      taxType:observable,
      selectedRowData:observable,
      errorMessages:observable,
      setErrorMessages:action,
      setAllTckn:action,
      setRowData:action,
      setPrice:action,
      setSelectedRowData:action,
      setTaxAmount:action,
      setTaxType:action,
      setTckn:action,
      setTotal:action,
      addRow:action,
      clearAllRows:action,
      deleteRow:action
    });
    
  }

  setErrorMessages(errorMessages:{rowIndex:number,message:string}[]){
    this.errorMessages=errorMessages
  }
  setAllTckn(tcknList:number[]){
    this.allTckn=tcknList
  }
  setRowData(updatedData:TaxData[]){
    this.rowData=updatedData
  }
  setPrice(newPrice:number){
    this.price=newPrice
  }

  setTaxAmount(newTaxAmount:number | null){
    this.taxAmount=newTaxAmount
  }

  setTotal(newTotal:number | null){
    this.total=newTotal
  }
  setSelectedRowData(rowData: TaxData | null) {
    this.selectedRowData = rowData;
  }

  setTckn(newTckn: number) {
    this.tckn = newTckn;
  }

  setTaxType(selectTaxType: string) {
    this.taxType = selectTaxType;
  }

  addRow(row: TaxData) {
    this.rowData.push(row);
  }

  clearAllRows() {
    this.rowData = [];
  }

  deleteRow(rowIndex: number) {
    this.rowData = this.rowData.filter((_, index) => index !== rowIndex);
  }

}

const taxStore = new TaxStore();
export default taxStore;
