const express=require('express');

const Router=express.Router();

const controller=require('../controller/member');



Router.route('/member').
    get(controller.getMembers)
    .post(controller.createMember);


Router.route('/member/:id').
    get(controller.getMember)
    .put(controller.updateMember)
    .delete(controller.deleteMember);



Router.route('/member/:memberId/month/:monthId/week/:weekId/addTask').
    post(controller.addTask);

Router.route('/member/:memberId/month/:monthId/week/:weekId/task/:taskId').
    put(controller.updateTask).
    // get(controller.getTasks).
    delete(controller.deleteTask);


Router.route('/member/:id/addmonth').
    post(controller.addMonth).
    // put(controller.updateMonth).
    // get(controller.getMonths).
    // delete(controller.deleteMonth);


module.exports = Router;