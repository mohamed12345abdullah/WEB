const Member = require('../mongoose/member');
const asyncWrapper = require('../middlewares/asyncWrapper');
const createError=require('../utils/createError');




const createMember=asyncWrapper(async(req,res)=>{
    const {name,email,college,year,phone}=req.body;
    if(!name || !email || !college || !year || !phone){
        return next(createError("All fields are required",400));
    }
    
    const member=await Member.create({name,email,college,year,phone});
    res.status(201).json({
        status:201,
        message:"Member created successfully",
        data:member
    });
})


const getMembers=asyncWrapper(async(req,res)=>{

    const members=await Member.find();
    res.status(200).json({
        status:200,
        message:"Members fetched successfully",
        data:members
    });
})


const getMember=asyncWrapper(async(req,res)=>{
    const member=await Member.findById(req.params.id);
    res.status(200).json({
        status:200,
        message:"Member fetched successfully",
        data:member
    });
})


const updateMember=asyncWrapper(async(req,res)=>{
    const memberId=req.params.id;
    const {name,email,college,year,phone}=req.body;
    if(!name || !email || !college || !year || !phone){
        return next(createError("All fields are required",400));
    }
    const member=await Member.findByIdAndUpdate(memberId,{name,email,college,year,phone},{new:true});
    res.status(200).json({
        status:200,
        message:"Member updated successfully",
        data:member
    });
})


const deleteMember=asyncWrapper(async(req,res)=>{
    const memberId=req.params.id;
    const member=await Member.findByIdAndDelete(memberId);
    res.status(200).json({
        status:200,
        message:"Member deleted successfully",
        data:member
    });       
})



const addMonth=asyncWrapper(async(req,res)=>{
    const memberId=req.params.id;
    const {name,date}=req.body;
    if(!name){
        return next(createError("All fields are required",400));
    }
    const member=await Member.findById(memberId);
    if(!member){
        return next(createError("Member not found",404));
    }
    const month=await member.months.create({name,date});
    // add for weeks of this month
    month.weeks.push([
        {
            name:"Week 1",
            date: new Date(date.getFullYear(), date.getMonth(), 1) // calc the date of the first week of this month
        },
        {
            name:"Week 2",
            date: new Date(date.getFullYear(), date.getMonth(), 1) + 7
        },
        {
            name:"Week 3",
            date: new Date(date.getFullYear(), date.getMonth(), 1) + 14
        },
        {
            name:"Week 4",
            date: new Date(date.getFullYear(), date.getMonth(), 1) + 21
        }
    ]);
    month.save();
    member.months.push(month);
    await member.save();
    res.status(200).json({
        status:200,
        message:"Month added successfully",
        data:month
    });
})




const addTask=asyncWrapper(async(req,res)=>{
    const memberId=req.params.memberId;
    const {monthId,weekId}=req.params;
    const {name,description,startDate,endDate,points,score,rate}=req.body;
    if(!name || !description || !startDate || !endDate || !points || !score || !rate){
        return next(createError("All fields are required",400));
    }
    const member=await Member.findById(memberId);
    if(!member){
        return next(createError("Member not found",404));
    }
    const task=await member.months.id(monthId).weeks.id(weekId).tasks.create({name,description,startDate,endDate,points,score,rate});
    member.months.id(monthId).weeks.id(weekId).tasks.push(task);
    await member.save();
    res.status(200).json({
        status:200,
        message:"Task added successfully",
        data:task
    });
})


const updateTask=asyncWrapper(async(req,res)=>{
    const memberId=req.params.memberId;
    const {monthId,weekId,taskId}=req.params;
    const {name,description,startDate,endDate,points,score,rate}=req.body;
    if(!name || !description || !startDate || !endDate || !points || !score || !rate){
        return next(createError("All fields are required",400));
    }
    const member=await Member.findById(memberId);
    if(!member){
        return next(createError("Member not found",404));
    }
    const task=await member.months.id(monthId).weeks.id(weekId).tasks.id(taskId).update({name,description,startDate,endDate,points,score,rate});
    await member.save();
    res.status(200).json({
        status:200,
        message:"Task updated successfully",
        data:task
    });
})

const deleteTask=asyncWrapper(async(req,res)=>{
    const memberId=req.params.memberId;
    const {monthId,weekId,taskId}=req.params;
    const member=await Member.findById(memberId);
    if(!member){
        return next(createError("Member not found",404));
    }
    const task=await member.months.id(monthId).weeks.id(weekId).tasks.id(taskId).delete();
    await member.save();
    res.status(200).json({
        status:200,
        message:"Task deleted successfully",
        data:task
    });
})

module.exports={
    createMember,
    getMembers,
    getMember,
    updateMember,
    deleteMember,
    addMonth,
    // updateMonth,
    // deleteMonth,
    addTask,
    updateTask,
    deleteTask
}
