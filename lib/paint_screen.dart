import 'package:flutter/material.dart';
import 'package:socket_io_client/socket_io_client.dart' as IO;
class PaintScreen extends StatefulWidget {
  //const PaintScreen({super.key});
  final Map data;
  final String screenFrom;
  PaintScreen({required this.data, required this.screenFrom});

  @override
  State<PaintScreen> createState() => _PaintScreenState();
}

class _PaintScreenState extends State<PaintScreen> {

  late IO.Socket _socket;
  String dataOfRoom = "";

  @override
  void initState() {
    // TODO: implement initState
    super.initState();
    connect();
  }

  //socket io client connection
  void connect(){
    _socket = IO.io('http://10.0.2.2:3000', <String, dynamic> {
      'transports': ['websocket'],
      'autoConnect': false
    });

    _socket.onConnectError((error) {
      print('Error connecting to socket: $error');
      // Handle error here, such as displaying an error message to the user.
    });
    _socket.connect();

    if(widget.screenFrom == "createRoom"){
      // print('still prints this');
      _socket.emit('create-game', widget.data);
    }
    else{
      print("debug tryyy");
      _socket.emit('join-game', widget.data);
    }

    //listen to socket
    _socket.onConnect((data) {
      print('connected socket yayy');
       print(widget.data);
      _socket.on('updateRoom', (roomData) {
        setState(() {
          dataOfRoom = roomData;
        });
        if(roomData['isJoin']!=true){
          // start timer
          // here -> wait for button click for turn to be over
        }
      });
    });
  }

  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(

      ),
    );
  }
}
