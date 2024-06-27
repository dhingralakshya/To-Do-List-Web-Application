const express=require("express");
const bodyParser=require("body-parser");
const mongoose=require("mongoose");
const _=require("lodash");
const ejs=require("ejs");
const app=express();

mongoose.connect("mongodb+srv://dhingralakshya290:lakshya01@cluster0.91azbdh.mongodb.net/todolistDB");

const itemsSchema={
    name:String
};

const Item=mongoose.model("Item",itemsSchema);
const wake=new Item({
    name:"Wake Up"
});
const study=new Item({
    name:"Study"
});

const defaultItems=[wake,study];

const listSchema={
    name:String,
    items:[itemsSchema]
};
const List=mongoose.model("List",listSchema);


// Item.insertMany(defaultItems);

// async function deleterepeated(){
//     await Item.deleteMany({name:"Wake Up",name:"Study"});
// }
// deleterepeated();

// async function find(){
//     const Items=await Item.find({});
//     Items.forEach(function(Item){
//         return Item.name;
//     })
// }





app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));  
app.set('view engine','ejs');
var day;
app.get("/",async function(req,res){
    var today=new Date();
    var option={
        weekday:"long",
        day:"numeric",
        month:"long"    
    };
    day=today.toLocaleDateString("en-US",option);
    const Items=await Item.find({});
    if(Items.length==0)
        {
            Item.insertMany(defaultItems);
            res.redirect("/");
        }
        else
        {
            res.render("list",{kindOfDay:day,listItem:Items});
        }  
});

app.get("/:customListName",async function(req,res){
    const listName=_.capitalize(req.params.customListName);
    const foundList=await List.findOne({name:listName});
    if(!foundList)
        {
            const list=new List({
                name:listName,
                items:defaultItems
            });
            list.save();
            res.redirect("/"+listName);   
        }
    else
    {
        res.render("list",{kindOfDay:listName,listItem:foundList.items});
    }
});


app.post("/",async function(req,res){
    const item=req.body.newItem;
    const listName=req.body.button;
    const newItem=new Item({
        name:item
    });
    if(listName==day){
        newItem.save();
        res.redirect("/");   
    }
    else{
        const foundList=await List.findOne({name:listName});
        foundList.items.push(newItem);
        foundList.save();
        res.redirect("/"+listName);
    }
});

app.post("/delete",async function(req,res){
    const id=req.body.checkbox;
    const listName=req.body.listName;
    if(listName==day){
        await Item.findByIdAndDelete(id);
        res.redirect("/");
    }
    else
    {   
        await List.updateOne({name:listName},{$pull:{items:{_id:id}}});
        res.redirect("/"+listName);
    }
})

app.listen(process.env.PORT || 3000);