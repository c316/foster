import { Meteor } from 'meteor/meteor';
import { ValidatedMethod } from 'meteor/mdg:validated-method';
import SimpleSchema from 'simpl-schema';
import Contacts from './contacts';

export const contactUpdate = new ValidatedMethod({
  name: 'contact.update',
  validate: new SimpleSchema({
    contactId: { type: String },
    name: { type: String },
    title: { type: String },
    phoneNumber: { type: String },
  }).validator(),
  run({
    contactId, name, title, phoneNumber,
  }) {
    const contact = Contacts.findOne(contactId);

    if (
      !this.userId
      || !contact
      || !contact.editableBy
      || contact.editableBy !== this.userId
    ) {
      throw new Meteor.Error(
        'contact.update.unauthorized',
        'Cannot edit that contact'
      );
    }

    Contacts.update(contactId, {
      $set: { name, title, phoneNumber },
    });
  },
});

export const contactInsert = new ValidatedMethod({
  name: 'contact.insert',
  validate: new SimpleSchema({
    name: { type: String },
    title: { type: String },
    phoneNumber: { type: String },
  }).validator(),
  run({ name, title, phoneNumber }) {
    if (!this.userId) {
      throw new Meteor.Error(
        'contact.insert.unauthorized',
        'Must be logged in'
      );
    }

    Contacts.insert({
      name,
      title,
      phoneNumber,
      editableBy: this.userId,
    });
  },
});

export const contactRemove = new ValidatedMethod({
  name: 'contact.remove',
  validate: new SimpleSchema({
    contactId: { type: String },
  }).validator(),
  run({ contactId }) {
    const contact = Contacts.findOne(contactId);

    if (!this.userId || this.userId !== contact.editableBy) {
      throw new Meteor.Error('contact.remove.unauthorized', 'Not authorized');
    }

    Contacts.remove(contactId);
  },
});
