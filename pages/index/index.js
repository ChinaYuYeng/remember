//index.js
//获取应用实例
const app = getApp()
var ONEDAY = 1000;

Page({
  data: {
    todos:[],
    input:'',
    inputMod:0
  },
  onLoad: function () {
    var me = this;
    var todos = wx.getStorageSync('todo_list');
    if (todos) {
      todos = todos.map(function(v){
        if (v.completed == true && (+new Date() - v.creatTime) >= ONEDAY){
          if (v.voice) {
            wx.removeSavedFile({
              filePath: v.voice,
              success: function () {
                console.log('load...删除成功');
              }
            })
          }
          return ;
        }
        return Object.assign( v, { _creatTime: me.transformDate(v.creatTime) })
      }).filter(function(k){
          return k;
      }).sort(function(a,b){
        return a.creatTime - b.creatTime;
      })
      this.setData({ todos: todos})
    }
  },
  startRecord:function(){
    var me = this;
    wx.startRecord({
      success:function(res){
          wx.saveFile({
            tempFilePath:res.tempFilePath,
            success:function(res){
              me.addTodos({ voice:res.savedFilePath})
            },
            fail:function(res){
              console.log('保存失败');
            }
          });
      },
      fail:function(res){
          console.log('录音失败了');
      }
    })
  },
  stopRecord:function(){
    wx.stopRecord();
  },
  addTodos: function (data) {
    var me = this;
    var todos = this.data.todos
    if (!this.data.input.trim() && !data.voice) return;
    todos.unshift({ title: this.data.input.trim(), voice: data.voice, completed: false, creatTime: +new Date()})
    this.setData({
      input: '',
      todos: todos
    })
    this.save()
  },
  save: function () {
    wx.setStorageSync('todo_list', this.data.todos)
  },
  playVoice:function(e){
    var index = e.currentTarget.dataset.index;
    var voice = this.data.todos[index].voice;
    if (voice){
      wx.playVoice({
        filePath: voice,
        complete: function () { }
      })
    }
  },
  toggleMod:function(){
    var currentMod = this.data.inputMod;
    var input = this.data.input;
    this.setData({
      inputMod: ++currentMod%2,
      input:input
    })
  },
  inputChangeHandle: function (e) {
    this.data.input = e.detail.value;
  },
  removeTodo: function (e) {
    var index = e.currentTarget.dataset.index
    var todos = this.data.todos
    var remove = todos.splice(index, 1)[0]
    if(remove.voice){
      wx.removeSavedFile({
        filePath: remove.voice,
        success:function(){
          console.log('删除成功');
        }
      })
    }
    this.setData({
      todos: todos
    })
    this.save()
  },
  toggleTodo: function (e) {
    var index = e.currentTarget.dataset.index
    var todos = this.data.todos
    todos[index].completed = !todos[index].completed
    this.setData({
      todos: todos
    })
    this.save()
  },
  transformDate:function(time){
    if(!time) return ;
    var now  = +new Date();
    var long = now - time;
    var days = long / 86400000 >> 0;
    var hour = (long % 86400000) / 3600000 >> 0;
    var min = (long % 86400000 % 3600000) / 60000 >> 0;
    var s = (long % 86400000 % 3600000 % 60000) / 1000 >> 0;
    return days ? days + '天' : hour ? hour + '小时' : min ? min+'分钟' : s ? s+'秒':'';
  }
})
