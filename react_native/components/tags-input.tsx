import React from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, ViewStyle, TextStyle } from "react-native";

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    alignItems: "center"
  },

  textInputContainer: {
    flex: 1,
    minWidth: 100,
    height: 32,
    margin: 4,
    borderRadius: 16,
    backgroundColor: "#ccc"
  },

  textInput: {
    margin: 0,
    padding: 0,
    paddingLeft: 12,
    paddingRight: 12,
    flex: 1,
    height: 32,
    fontSize: 13,
    color: "rgba(0, 0, 0, 0.87)"
  },

  tag: {
    justifyContent: "center",
    backgroundColor: "#e0e0e0",
    borderRadius: 16,
    paddingLeft: 12,
    paddingRight: 12,
    height: 32,
    margin: 4
  },
  tagLabel: {
    fontSize: 13,
    color: "rgba(0, 0, 0, 0.87)"
  }
});

interface TagProps {
  label: string;
  onPress? (e: any): void;
  tagContainerStyle? : ViewStyle;
  tagTextStyle? : TextStyle,
  readonly? : boolean;
}

const Tag = (props: TagProps) => {
  const tagText = (
    <Text style={[styles.tagLabel, props.tagTextStyle]}>{props.label}</Text>
  );

  if (props.readonly) {
    return (
      <View style={[styles.tag, props.tagContainerStyle]}> {tagText} </View>
    )
  } else {
    return (
      <TouchableOpacity style={[styles.tag, props.tagContainerStyle]} onLongPress={props.onPress}>{tagText}</TouchableOpacity>
    )
  }
}


interface TagsInputProps {
  initialText: string;
  initialTags: Array<string>;
  onChangeTags ? (tags: Array<string>): void;
  containerStyle?: ViewStyle;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  tagContainerStyle?: ViewStyle;
  tagTextStyle?: TextStyle;
  readonly?: boolean;
  maxNumberOfTags: number;
  onTagPress ? (index: number, tag: string, event: any, deleted: boolean) : void;
  deleteOnTagPress?: boolean;
};

interface TagsInputState {
  tags: Array<string>;
  text: string;
}

class TagsInput extends React.Component<TagsInputProps, TagsInputState> {
  constructor(props: TagsInputProps) {
    super(props);

    this.state = {
      tags: props.initialTags,
      text: props.initialText
    };
  }

  componentWillReceiveProps(props: TagsInputProps) {
    const { initialTags = [], initialText = " " } = props;
    this.setState({
      tags: initialTags,
      text: initialText
    });
  }

  onChangeText = (text: string) => {
    if (text.length === 0) {
      // `onKeyPress` isn't currently supported on Android; I've placed an extra
      //  space character at the start of `TextInput` which is used to determine if the
      //  user is erasing.
      this.setState({
          tags: this.state.tags.slice(0, -1),
          text: this.state.tags.slice(-1)[0] || " "
        },
        () =>
        this.props.onChangeTags && this.props.onChangeTags(this.state.tags)
      );
    } else if (text.length > 1 && (text.slice(-1) === " " || text.slice(-1) === ",") && !(this.state.tags.indexOf(text.slice(0, -1).trim()) > -1)) {
      this.setState({
          tags: [...this.state.tags, text.slice(0, -1).trim()],
          text: " "
        },
        () => this.props.onChangeTags && this.props.onChangeTags(this.state.tags)
      );
    } else {
      this.setState({ text });
    }
  };

  onPressTag = (index:number, tag: string, event: any) => {
    const {
      deleteOnTagPress,
      onTagPress,
    } = this.props;

    if (deleteOnTagPress) {
      this.setState({
          tags: [
            ...this.state.tags.slice(0, index),
            ...this.state.tags.slice(index + 1)
          ]
        },
        () => {
          this.props.onChangeTags &&
            this.props.onChangeTags(this.state.tags);
          onTagPress && onTagPress(index, tag, event, true);
        }
      );
    } else {
      onTagPress && onTagPress(index, tag, event, false);
    }
  };

  render() {
    const {
      containerStyle,
      style,
      tagContainerStyle,
      tagTextStyle,
      readonly,
      maxNumberOfTags,
      inputStyle
    } = this.props;

    return (
      <View style = {[styles.container, containerStyle, style]}>
        {
          this.state.tags.map((tag, i) => (
            <Tag key = {i} label = {tag}
              onPress = {e => { this.onPressTag(i, tag, e); }}
              readonly = {readonly}
              tagContainerStyle = {tagContainerStyle}
              tagTextStyle = {tagTextStyle}
            />
          ))
        }
        {
          !readonly && maxNumberOfTags > this.state.tags.length && (
            <View style={[styles.textInputContainer]}>
              <TextInput value={this.state.text} style = {[styles.textInput, inputStyle]}
                onChangeText = {this.onChangeText}
                underlineColorAndroid = "transparent"
                autoCapitalize = "none" />
            </View>
          )
        }
      </View>
    );
  }
}


export { TagsInput, Tag, TagsInputProps };