const useFetch=async (url: string) => {
    const response = await fetch(url);
    let loading=true;
    let error=null;
    if (!response.ok) {
        throw new Error('Network response was not ok');
    }
    const data = await response.json();
    if(error){
        error=[]
    }
    const add=(data:any)=>{
        data.push(data) }
    loading=false;
    return {
        data,
        loading,
        error,
        add
    }
    }